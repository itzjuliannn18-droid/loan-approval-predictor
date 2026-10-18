import joblib
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["https://itzjuliannn18-droid.github.io", "http://localhost:5173"])model = joblib.load("model.joblib")

TEXT_FIELDS = ["Gender", "Married", "Dependents", "Education",
               "Self_Employed", "Property_Area", "Credit_History"]
NUM_FIELDS = ["ApplicantIncome", "CoapplicantIncome", "LoanAmount", "Loan_Amount_Term"]


@app.get("/")
def home():
    return jsonify(message="Loan API is running")


@app.post("/predict")
def predict():
    data = request.get_json(silent=True) or {}
    try:
        row = {f: str(data[f]) for f in TEXT_FIELDS}
        row.update({f: float(data[f]) for f in NUM_FIELDS})
    except (KeyError, ValueError, TypeError):
        return jsonify(error="Invalid or missing input"), 400

    proba = float(model.predict_proba(pd.DataFrame([row]))[0][1])
    return jsonify(approved=proba >= 0.5, probability=round(proba * 100, 1))


if __name__ == "__main__":
    app.run(port=5000, debug=True)
