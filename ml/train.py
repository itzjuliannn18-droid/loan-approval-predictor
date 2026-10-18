import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# Use an absolute path (prefix with 'r' to handle Windows backslashes)
df = pd.read_csv(r"E:\onedrive_download\loan-project\ml\loan.csv.csv").drop(columns=["Loan_ID"])
df["Credit_History"] = df["Credit_History"].map({1.0: "Yes", 0.0: "No"})
y = (df.pop("Loan_Status") == "Y").astype(int)   # Y = 1, N = 0
X = df

NUM = ["ApplicantIncome", "CoapplicantIncome", "LoanAmount", "Loan_Amount_Term"]
CAT = ["Gender", "Married", "Dependents", "Education",
       "Self_Employed", "Property_Area", "Credit_History"]

pre = ColumnTransformer([
    ("num", Pipeline([("imp", SimpleImputer(strategy="median")),
                      ("sc", StandardScaler())]), NUM),
    ("cat", Pipeline([("imp", SimpleImputer(strategy="most_frequent")),
                      ("oh", OneHotEncoder(handle_unknown="ignore"))]), CAT),
])

models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Random Forest": RandomForestClassifier(n_estimators=200, max_depth=5, random_state=42),
    "Gradient Boosting": GradientBoostingClassifier(random_state=42),
}

X_tr, X_te, y_tr, y_te = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42)

best_name, best_score, best_pipe = None, 0, None
for name, m in models.items():
    pipe = Pipeline([("pre", pre), ("model", m)])
    score = cross_val_score(pipe, X_tr, y_tr, cv=5, scoring="accuracy").mean()
    print(f"{name}: CV accuracy = {score:.3f}")
    if score > best_score:
        best_name, best_score, best_pipe = name, score, pipe

print("\nBest model:", best_name)
best_pipe.fit(X_tr, y_tr)
pred = best_pipe.predict(X_te)
print("Test accuracy:", accuracy_score(y_te, pred))
print(confusion_matrix(y_te, pred))
print(classification_report(y_te, pred, target_names=["Rejected", "Approved"]))

joblib.dump(best_pipe, "model.joblib")
print("Saved model.joblib")