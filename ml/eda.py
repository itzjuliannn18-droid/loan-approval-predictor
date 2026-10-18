import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("E:\onedrive_download\loan-project\ml\loan.csv.csv")
print(df.shape)
print(df.isnull().sum())                 # missing values per column
print(df["Loan_Status"].value_counts())

# Credit history is the strongest signal. Plot approval rate by it.
(df.groupby("Credit_History")["Loan_Status"]
   .value_counts(normalize=True).unstack().plot(kind="bar"))
plt.title("Approval rate by credit history")
plt.show()