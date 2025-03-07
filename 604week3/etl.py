import pandas as pd
import sqlite3

# Extract: Read customer and orders data from CSV files
customers_df = pd.read_csv('customer.csv')
orders_df = pd.read_csv('orders.csv')

# Transform: Merge orders and customers data on CustomerID
merged_df = pd.merge(orders_df, customers_df, on='CustomerID', how='inner')

# Transform: Calculate TotalAmount for each order
merged_df['TotalAmount'] = merged_df['Quantity'] * merged_df['Price']

# Transform: Add Status column based on OrderDate
merged_df['Status'] = merged_df['OrderDate'].apply(lambda d: 'New' if d.startswith('2025-03') else 'Old')

# Transform: Filter high-value orders (TotalAmount > 4500)
high_value_orders = merged_df[merged_df['TotalAmount'] > 4500]

# Load: Connect to SQLite database
conn = sqlite3.connect('ecommerce.db')

# Load: Create HighValueOrders table if it doesn't exist
create_table_query = '''
CREATE TABLE IF NOT EXISTS HighValueOrders (
    OrderID INTEGER,
    CustomerID INTEGER,
    Name TEXT,
    Email TEXT,
    Product TEXT,
    Quantity INTEGER,
    Price REAL,
    OrderDate TEXT,
    TotalAmount REAL,
    Status TEXT
)
'''
conn.execute(create_table_query)

# Load: Insert high-value orders into the database
high_value_orders.to_sql('HighValueOrders', conn, if_exists='replace', index=False)

# Load: Query and print the data from the database
result = conn.execute('SELECT * FROM HighValueOrders')
for row in result.fetchall():
    print(row)

# Load: Close the database connection
conn.close()

# Completion message
print("ETL process completed successfully!")
