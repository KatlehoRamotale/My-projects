import pandas as pd 
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import matplotlib.pyplot as plt
from matplotlib import pyplot as plt

print(' --- Training Smart Business Expense Predictor Model ---')

try:
	data = pd.read_csv('monthly_expenses.csv', index_col = 'Month', parse_dates=True) 
	print('Data loaded Successfully. Shape:', data.shape)
except FileNotFoundError:
	print('Error: monthly_expenses.csv not found. Please run generated_data.py first.')
	exit()

X = np.array(range(1, len(data)+1)).reshape(-1,1)
y = data['expenses_R']


X_train, y_train = X, y
print(f'Train data size: {len(X_train)} samples.')

model = LinearRegression()

model.fit(X_train, y_train)

print('Model Training Complete')
print(f'Model Coefficient (slope): {model.coef_[0]: .2f} R/month')
print(f'Model Intercept: {model.intercept_:.2f}')

y_pred = model.predict(X_train)

mae = mean_absolute_error(y_train, y_pred)
r2 = r2_score(y_train, y_pred)
print(f'Model Evaluation')
print(f'Mean Absolute Error: {mae:.2f}')
print(f'R-Squared Score: {r2:.2f}')

#Visualise the generated data
plt.figure(figsize = (12, 6))
plt.plot(data.index, y, label = 'Actual Expense',marker = 'o', linestyle = '-', color = 'purple', markersize=4)
plt.plot(data.index, y_pred, label= 'Predicted Expenses (Model)', linestyle= '--', color = 'green')
plt.title('Monthly Business Expense (Actual vs. Predicted')
plt.ylabel('expenses (R)')
plt.xlabel('Month')
plt.grid(True)
plt.legend()
plt.tight_layout()
plt.savefig('model_predictions.png')
model_filename = 'expense_predictor_model.pkl'
joblib.dump(model, model_filename)
print('Machine learning model saved!')
plt.show()