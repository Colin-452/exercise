import mysql.connector
import matplotlib.pyplot as plt
import pandas as pd

# Database connection
conn = mysql.connector.connect(
    host='sql201.infinityfree.com',
    database='if0_38341114_week10',
    user='if0_38341114',
    password='RDG8yHog9b'
)

# Report 1: Enrollment by Department
query1 = """
SELECT d.department_name, COUNT(*) as count 
FROM fact_enrollment e
JOIN dim_course c ON e.course_id = c.course_id
JOIN dim_department d ON c.department_id = d.department_id
GROUP BY d.department_name
"""
df1 = pd.read_sql(query1, conn)

# Pie Chart
plt.figure(figsize=(8,8))
plt.pie(df1['count'], labels=df1['department_name'], autopct='%1.1f%%')
plt.title('Course Enrollment by Department')
plt.savefig('enrollment_pie.png')
plt.close()

# Report 2: Attendance by Course
query2 = """
SELECT c.course_name, 
       ROUND(SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as rate
FROM fact_attendance a
JOIN dim_course c ON a.course_id = c.course_id
GROUP BY c.course_name
HAVING COUNT(*) > 10
ORDER BY rate DESC
LIMIT 5
"""
df2 = pd.read_sql(query2, conn)

# Bar Chart
plt.figure(figsize=(10,6))
plt.bar(df2['course_name'], df2['rate'])
plt.title('Top 5 Courses by Attendance Rate')
plt.ylabel('Attendance Rate (%)')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('attendance_bar.png')

conn.close()