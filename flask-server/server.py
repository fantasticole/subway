from flask import Flask
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

ROUTES = [
"1",
"2",
"3",
"4",
"5",
"6",
"6X",
"7",
"7X",
"A",
"B",
"C",
"D",
"E",
"F",
"FS",
"FX",
"G",
"H",
"J",
"L",
"M",
"N",
"Q",
"R",
"S",
"SI",
"SS",
"W",
"Z",
]

# Members API Route
@app.route("/routes")
def routes():
	return {"data": ROUTES}

if __name__ == "__main__":
	app.run(debug=True)
