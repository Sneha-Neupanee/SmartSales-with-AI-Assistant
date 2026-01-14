import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from tensorflow import keras
from tensorflow.keras import layers
import os
from . import models

def fetch_historical_sales(db: Session):
    """Fetch all historical sales data from database"""
    sales = (
        db.query(
            models.Sale.id,
            models.Sale.product_id,
            models.Sale.quantity,
            models.Sale.sale_price,
            models.Sale.sale_date,
            models.Product.name.label('product_name'),
            models.Product.category,
            models.Product.cost_price,
            models.Product.sell_price
        )
        .join(models.Product, models.Sale.product_id == models.Product.id)
        .all()
    )
    
    # Convert to DataFrame
    df = pd.DataFrame([
        {
            'sale_id': s.id,
            'product_id': s.product_id,
            'product_name': s.product_name,
            'category': s.category,
            'quantity': s.quantity,
            'sale_price': s.sale_price,
            'cost_price': s.cost_price,
            'sell_price': s.sell_price,
            'sale_date': s.sale_date
        }
        for s in sales
    ])
    
    return df

def create_features(df):
    """Create ML features from sales data"""
    if df.empty:
        return df
    
    # Convert date to datetime
    df['sale_date'] = pd.to_datetime(df['sale_date'])
    
    # Temporal features
    df['day_of_week'] = df['sale_date'].dt.dayofweek  # 0=Monday, 6=Sunday
    df['day_of_month'] = df['sale_date'].dt.day
    df['week_of_year'] = df['sale_date'].dt.isocalendar().week
    df['month'] = df['sale_date'].dt.month
    df['quarter'] = df['sale_date'].dt.quarter
    df['year'] = df['sale_date'].dt.year
    
    # Product ID embedding (label encoding)
    le_product = LabelEncoder()
    df['product_id_encoded'] = le_product.fit_transform(df['product_id'])
    
    # Category embedding
    le_category = LabelEncoder()
    df['category_encoded'] = le_category.fit_transform(df['category'])
    
    # Price features
    df['profit_per_unit'] = df['sale_price'] - df['cost_price']
    df['profit_margin'] = (df['profit_per_unit'] / df['sale_price']) * 100
    df['total_revenue'] = df['quantity'] * df['sale_price']
    df['total_profit'] = df['quantity'] * df['profit_per_unit']
    
    # Price relative to standard sell price
    df['price_vs_standard'] = df['sale_price'] / df['sell_price']
    
    return df, le_product, le_category

def split_train_test(df, test_size=0.2, random_state=42):
    """Split data into training and testing sets"""
    if df.empty or len(df) < 2:
        return None
    
    # Feature columns for ML
    feature_cols = [
        'product_id_encoded',
        'category_encoded',
        'day_of_week',
        'week_of_year',
        'month',
        'quarter',
        'sale_price',
        'price_vs_standard'
    ]
    
    # Target variable (what we want to predict)
    target_col = 'quantity'
    
    X = df[feature_cols]
    y = df[target_col]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )
    
    return {
        'X_train': X_train,
        'X_test': X_test,
        'y_train': y_train,
        'y_test': y_test,
        'feature_columns': feature_cols,
        'target_column': target_col
    }

def prepare_ml_data(db: Session):
    """Complete data preparation pipeline"""
    # Step 1: Fetch historical sales
    df = fetch_historical_sales(db)
    
    if df.empty:
        return {
            "status": "error",
            "message": "No sales data available",
            "data": None
        }
    
    # Step 2: Create features
    df_features, le_product, le_category = create_features(df)
    
    # Step 3: Split train/test
    split_data = split_train_test(df_features)
    
    if split_data is None:
        return {
            "status": "error",
            "message": "Not enough data to split",
            "data": None
        }
    
    return {
        "status": "success",
        "message": "Data prepared successfully",
        "data": {
            "total_records": len(df_features),
            "train_records": len(split_data['X_train']),
            "test_records": len(split_data['X_test']),
            "features": split_data['feature_columns'],
            "target": split_data['target_column'],
            "sample_features": df_features[split_data['feature_columns']].head(5).to_dict('records')
        },
        "encoders": {
            "product_classes": le_product.classes_.tolist(),
            "category_classes": le_category.classes_.tolist()
        }
    }

def build_model(input_dim):
    """Build a simple feed-forward neural network"""
    model = keras.Sequential([
        layers.Input(shape=(input_dim,)),
        layers.Dense(64, activation='relu'),
        layers.Dropout(0.2),
        layers.Dense(32, activation='relu'),
        layers.Dropout(0.2),
        layers.Dense(16, activation='relu'),
        layers.Dense(1, activation='linear')  # Output layer for regression
    ])
    
    model.compile(
        optimizer='adam',
        loss='mse',
        metrics=['mae']
    )
    
    return model

def train_model(db: Session, epochs=50, batch_size=4):
    """Train the ML model"""
    # Prepare data
    df = fetch_historical_sales(db)
    
    if df.empty or len(df) < 2:
        return {
            "status": "error",
            "message": "Not enough data to train model (minimum 2 records required)"
        }
    
    # Create features
    df_features, le_product, le_category = create_features(df)
    
    # Split data
    split_data = split_train_test(df_features)
    
    if split_data is None:
        return {
            "status": "error",
            "message": "Failed to split data"
        }
    
    X_train = split_data['X_train']
    X_test = split_data['X_test']
    y_train = split_data['y_train']
    y_test = split_data['y_test']
    
    # Convert to numpy arrays with float32 dtype
    X_train = X_train.values.astype('float32')
    X_test = X_test.values.astype('float32')
    y_train = y_train.values.astype('float32')
    y_test = y_test.values.astype('float32')
    
    # Build model
    model = build_model(input_dim=X_train.shape[1])
    
    # Train model
    history = model.fit(
        X_train, y_train,
        epochs=epochs,
        batch_size=batch_size,
        validation_split=0.2,
        verbose=0
    )
    
    # Evaluate on test set
    test_loss, test_mae = model.evaluate(X_test, y_test, verbose=0)
    
    # Make predictions
    y_pred = model.predict(X_test, verbose=0)
    
    # Calculate metrics
    mse = mean_squared_error(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    
    # Save model
    model_path = "sales_prediction_model.keras"
    model.save(model_path)
    
    # ⭐ NEW: Helper function to handle NaN/Inf values for JSON serialization
    def safe_float(value):
        if np.isnan(value) or np.isinf(value):
            return 0.0
        return float(value)
    
    return {
        "status": "success",
        "message": "Model trained successfully (Warning: Limited training data may result in poor performance)",
        "training_info": {
            "total_records": len(df_features),
            "train_records": len(X_train),
            "test_records": len(X_test),
            "epochs": epochs,
            "batch_size": batch_size
        },
        "performance": {
            "test_loss": safe_float(test_loss),
            "test_mae": safe_float(test_mae),
            "mse": safe_float(mse),
            "rmse": safe_float(rmse),
            "mae": safe_float(mae),
            "r2_score": safe_float(r2)
        },
        "model_saved": model_path,
        "training_history": {
            "final_train_loss": safe_float(history.history['loss'][-1]),
            "final_val_loss": safe_float(history.history['val_loss'][-1]),
            "final_train_mae": safe_float(history.history['mae'][-1]),
            "final_val_mae": safe_float(history.history['val_mae'][-1])
        }
    }
def predict_sales(db: Session, product_id: int, days: int = 7):
    """Predict future sales for a product"""
    from datetime import timedelta
    
    # Check if model exists
    model_path = "sales_prediction_model.keras"
    if not os.path.exists(model_path):
        return {
            "status": "error",
            "message": "Model not found. Please train the model first."
        }
    
    # Load the trained model
    model = keras.models.load_model(model_path)
    
    # Get product info
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product is None:
        return {
            "status": "error",
            "message": f"Product with ID {product_id} not found"
        }
    
    # Get historical sales for encoding
    df = fetch_historical_sales(db)
    if df.empty:
        return {
            "status": "error",
            "message": "No historical sales data available"
        }
    
    # Create features to get encoders
    df_features, le_product, le_category = create_features(df)
    
    # Generate predictions for future dates
    predictions = []
    current_date = datetime.now().date()
    
    for day in range(days):
        future_date = current_date + timedelta(days=day)
        
        # Create feature vector for prediction
        try:
            product_encoded = le_product.transform([product_id])[0]
        except:
            product_encoded = 0
        
        try:
            category_encoded = le_category.transform([product.category])[0]
        except:
            category_encoded = 0
        
        # Create features
        features = np.array([[
            product_encoded,                    # product_id_encoded
            category_encoded,                   # category_encoded
            future_date.weekday(),              # day_of_week
            future_date.isocalendar()[1],       # week_of_year
            future_date.month,                  # month
            (future_date.month - 1) // 3 + 1,   # quarter
            float(product.sell_price),          # sale_price
            1.0                                 # price_vs_standard
        ]], dtype='float32')
        
        # Make prediction
        predicted_quantity = model.predict(features, verbose=0)[0][0]
        
        # Ensure non-negative prediction
        predicted_quantity = max(0, float(predicted_quantity))
        
        predictions.append({
            "date": future_date.strftime("%Y-%m-%d"),
            "predicted_quantity": round(predicted_quantity, 2),
            "day_of_week": future_date.strftime("%A")
        })
    
    return {
        "status": "success",
        "product": {
            "id": product.id,
            "name": product.name,
            "category": product.category,
            "sell_price": float(product.sell_price)
        },
        "predictions": predictions,
        "total_predicted_demand": round(sum(p["predicted_quantity"] for p in predictions), 2)
    }