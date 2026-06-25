from flask import Flask, jsonify, request, render_template
import joblib
import numpy as np 
import os

app = Flask(__name__)

# machine learning model loading
MODEL_PATH = 'expense_predictor_model.pkl'
model = None

if os.path.exists(MODEL_PATH):
	model = joblib.load(MODEL_PATH)
	print(f'Machine learning model loaded successfully from {MODEL_PATH}')
else:
	print(f'WARNING: Model file {MODEL_PATH} not found. Please run train_model.py first')

@app.route('/')#create route for the app/webapp,  ('/') will be used to navigate to the next page 
def home():#then you define it -this one is home page
	return render_template('home.html')#here we are calling the template we created as html for our api

@app.route('/predict_expense', methods = ['POST'])
def predict_expense():
	#check if the model was loaded successfully
	if model is None:
		return jsonify({'error': 'Expense prediction model not available. Please train the model first'}), 500
	request_data = request.get_json()

	if not request_data or 'month_number' not in request_data:
		return({'error': 'Please provide "month_number" in the request body'}), 400 # bad request
	try: 
		month_number = int(request_data['month_number'])

		if month_number <= 0: 
			return jsonify({'error': '"month_number" must be positive integer'}),400
		prediction_input = np.array([[month_number]])

		predicted_expense = model.predict(prediction_input) [0]
		predicted_expense = max(0, round(predicted_expense, 2))

		return jsonify({
			'month_number': month_number,
			'predicted_expense_R': predicted_expense
			})
	except ValueError:
		return jsonify ({'error': 'invalid "month_number" value. Must be an integer' }), 400
	except Exception as e:
		return jsonify({'error': f'An unexpected error occured during prediction: {str(e)}'}), 500

#Run the flask Application 
if __name__=='__main__':
	app.run(debug =True)