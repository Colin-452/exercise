import pandas as pd
import sqlite3


customers_df = pd.read_csv('customer.csv')
orders_df = pd.read_csv('orders.csv')


merged_df = pd.merge(orders_df, customers_df, on='CustomerID', how='inner')


merged_df['TotalAmount'] = merged_df['Quantity'] * merged_df['Price']


merged_df['Status'] = merged_df['OrderDate'].apply(lambda d: 'New' if d.startswith('2025-03') else 'Old')


high_value_orders = merged_df[merged_df['TotalAmount'] > 4500]


conn = sqlite3.connect('ecommerce.db')


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


high_value_orders.to_sql('HighValueOrders', conn, if_exists='replace', index=False)


result = conn.execute('SELECT * FROM HighValueOrders')
for row in result.fetchall():
    print(row)


conn.close()

print("ETL process completed successfully!")
