import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# ---Config for data generations 
num_months = 36
start_date = '2023-01-01'
base_expense = 10000
monthly_increase = 200
random_flactuation = 1500

print('--- Generating Synthetic Business Expense Data ---')

#creating a range of monthly dates
dates = pd.date_range(start = start_date, periods = num_months, freq = 'MS')

# Generate expense
expenses = []
for i in range(num_months):
	expense = base_expense + (i*monthly_increase)+np.random.uniform(-random_flactuation,random_flactuation)
	expenses.append(max(5000, round(expense,2)))

#Create a dataframe
data = pd.DataFrame({
	'Month': dates,
	'expenses_R': expenses
	})
data.set_index('Month', inplace = True)

print('Data generated successfully. First 5 rows')
print(data.head())

#Visualise the generated data
plt.figure(figsize = (12, 6))
plt.plot(data.index, data['expenses_R'], marker = 'o', linestyle = '-', color = 'purple', markersize=4)
plt.title('Historical Monthly Business Expense')
plt.ylabel('expenses (R)')
plt.xlabel('Month')
plt.grid(True)
plt.tight_layout()
plt.savefig('Historical_Expenses.png')
#save data to csv
data.to_csv('monthly_expenses.csv')
print('Historical Expense data saved to monthly_expenses.csv')
plt.show()
