let headers = [];
let rawData = [];
let processedData = [];

document.getElementById("fileInput").addEventListener("change", function(e) {
  const reader = new FileReader();
  reader.onload = () => parseCSV(reader.result);
  reader.readAsText(e.target.files[0]);
});

function parseCSV(text) {
  const rows = text.trim().split("\n");
  headers = rows[0].split(",");
  rawData = rows.slice(1).map(r => r.split(","));
}

function processData() {
  let numericalCols = [];
  let categoricalCols = [];

  headers.forEach((h, i) => {
    if (!isNaN(rawData[0][i])) numericalCols.push(i);
    else categoricalCols.push(i);
  });

  document.getElementById("features").innerText =
    `Numerical Features: ${numericalCols.length}, Categorical Features: ${categoricalCols.length}`;

  let encoded = encodeCategorical(categoricalCols);
  let scaled = scaleNumerical(encoded, numericalCols);

  processedData = scaled;
  showComparison(numericalCols);
  showMLImpact();
}

/* ---------- Encoding ---------- */
function encodeCategorical(catCols) {
  let data = JSON.parse(JSON.stringify(rawData));

  catCols.forEach(col => {
    let unique = [...new Set(data.map(r => r[col]))];

    if (unique.length <= 5) {
      // Label Encoding
      unique.forEach((val, idx) => {
        data.forEach(r => {
          if (r[col] === val) r[col] = idx;
        });
      });
    } else {
      // One-Hot Encoding
      unique.forEach(val => headers.push(headers[col] + "_" + val));
      data.forEach(r => {
        unique.forEach(val => r.push(r[col] === val ? 1 : 0));
        r[col] = 0;
      });
    }
  });
  return data;
}

/* ---------- Scaling ---------- */
function scaleNumerical(data, numCols) {
  numCols.forEach(col => {
    let values = data.map(r => +r[col]);
    let mean = values.reduce((a,b)=>a+b,0) / values.length;
    let std = Math.sqrt(values.map(v => Math.pow(v - mean, 2))
        .reduce((a,b)=>a+b,0) / values.length);

    data.forEach(r => {
      r[col] = ((r[col] - mean) / std).toFixed(3);
    });
  });
  return data;
}

/* ---------- Comparison ---------- */
function showComparison(numCols) {
  document.getElementById("comparison").innerText =
    `Scaling applied using StandardScaler (mean=0, std=1) on ${numCols.length} numerical features.`;
}

/* ---------- ML Impact ---------- */
function showMLImpact() {
  const points = [
    "Encoded categorical data makes ML models understand non-numeric values.",
    "Scaling ensures equal feature contribution.",
    "Distance-based algorithms benefit significantly.",
    "Faster convergence in gradient-based models.",
    "Preprocessed data improves accuracy and stability."
  ];

  const ul = document.getElementById("mlImpact");
  ul.innerHTML = "";
  points.forEach(p => {
    let li = document.createElement("li");
    li.innerText = p;
    ul.appendChild(li);
  });
}

/* ---------- Download ---------- */
function downloadCSV() {
  let csv = headers.join(",") + "\n";
  processedData.forEach(r => csv += r.join(",") + "\n");

  let blob = new Blob([csv], { type: "text/csv" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "preprocessed_dataset.csv";
  link.click();
}
