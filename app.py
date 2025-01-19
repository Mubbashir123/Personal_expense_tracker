from flask import Flask, request, jsonify, render_template
from flask_pymongo import PyMongo
from datetime import datetime
from bson import ObjectId
import json

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/expense_tracker"
mongo = PyMongo(app)

 # Route for home page
@app.route('/')
def home():
    return render_template('index.html')


@app.route('/api/income', methods=['POST'])
def add_income():
    data = request.json
    income = {
        'amount': float(data['amount']),
        'source': data['source'],
        'date': datetime.now()
    }
    mongo.db.income.insert_one(income)
    return jsonify({"message": "Income added successfully"}), 201


@app.route('/api/expense', methods=['POST'])
def add_expense():
    data = request.json
    expense = {
        'amount': float(data['amount']),
        'category': data['category'],
        'description': data['description'],
        'date': datetime.now()
    }
    mongo.db.expenses.insert_one(expense)
    return jsonify({"message": "Expense added successfully"}), 201


@app.route('/api/saving', methods=['POST'])
def add_saving():
    data = request.json
    saving = {
        'amount': float(data['amount']),
        'description': data['description'],
        'date': datetime.now()
    }
    mongo.db.savings.insert_one(saving)
    return jsonify({"message": "Saving added successfully"}), 201


@app.route('/api/summary', methods=['GET'])
def get_summary():
    
    income = list(mongo.db.income.find({}, {'_id': False}))
    total_income = sum(item['amount'] for item in income)

    
    expenses = list(mongo.db.expenses.find({}, {'_id': False}))
    total_expenses = sum(item['amount'] for item in expenses)
    
    
    savings = list(mongo.db.savings.find({}, {'_id': False}))
    total_savings = sum(item['amount'] for item in savings)

    
    expense_by_category = {}
    for expense in expenses:
        category = expense['category']
        amount = expense['amount']
        expense_by_category[category] = expense_by_category.get(category, 0) + amount

    return jsonify({
        "total_income": total_income,
        "total_expenses": total_expenses,
        "total_savings": total_savings,
        "expense_by_category": expense_by_category,
        "recent_expenses": expenses[-5:],  # Last 5 expenses
        "recent_income": income[-5:],      # Last 5 income entries
        "recent_savings": savings[-5:]      # Last 5 savings entries
    })

if __name__ == '__main__':
    app.run(debug=True)
