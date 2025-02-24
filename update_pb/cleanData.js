const fs = require("fs");

// Read the JSON file
fs.readFile("LOL.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  try {
    const jsonData = JSON.parse(data);

    // Remove the blockName key from each object
    const updatedData = jsonData.map((item) => {
      if (item.hasOwnProperty("id")) {
        delete item.id;
      }
      return item;
    });

    // Write the updated data back to the file
    fs.writeFile(
      "LOL.json",
      JSON.stringify(updatedData, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.error("Error writing file:", err);
          return;
        }
        console.log("File successfully updated!");
      }
    );
  } catch (err) {
    console.error("Error parsing JSON:", err);
  }
});
