// import Vue from 'vue'

// function downloadCSV(csv, filename) {
//     var csvFile;
//     var downloadLink;

//     // CSV file
//     csvFile = new Blob([csv], {type: "text/csv"});

//     // Download link
//     downloadLink = document.createElement("a");

//     // File name
//     downloadLink.download = filename;

//     // Create a link to the file
//     downloadLink.href = window.URL.createObjectURL(csvFile);

//     // Hide download link
//     downloadLink.style.display = "none";

//     // Add the link to DOM
//     document.body.appendChild(downloadLink);

//     // Click download link
//     downloadLink.click();
// }

// Vue.prototype.$exportTable = function(table_name,filename) {
// 	var csv = [];
// 	var table = document.getElementById(table_name)
// 	var rows = table.getElementsByTagName("tr");

//     for (var i = 0; i < rows.length; i++) {
//         var row = [], cols = rows[i].querySelectorAll("td, th");

// 		for (var j = 0; j < cols.length; j++)
//             row.push(cols[j].innerText.replace(/,/g, ''));

//         csv.push(row.join(","));
//     }

//     // Download CSV file
//     downloadCSV(csv.join("\n"), filename);
// }


// updated vue3 code


import { createApp } from 'vue';

function downloadCSV(csv, filename) {
    let csvFile = new Blob([csv], { type: "text/csv" });
    let downloadLink = document.createElement("a");

    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink); // Cleanup
}

const exportTable = (table_name, filename) => {
    let csv = [];
    let table = document.getElementById(table_name);
    if (!table) return;

    let rows = table.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {
        let row = [];
        let cols = rows[i].querySelectorAll("td, th");

        for (let j = 0; j < cols.length; j++)
            row.push(cols[j].innerText.replace(/,/g, ''));

        csv.push(row.join(","));
    }

    // Download CSV file
    downloadCSV(csv.join("\n"), filename);
};

// Create and configure the Vue 3 app
const app = createApp({});

// Register the global method
app.config.globalProperties.$exportTable = exportTable;

export { exportTable }; // Export if needed for external use

