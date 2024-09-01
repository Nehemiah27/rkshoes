document.addEventListener("DOMContentLoaded", function () {
  const postNewButton = document.getElementById("upload-all"),
    messageShow = document.getElementById("post-new-message"),
    inputCSV = document.getElementById("data-csv-input"),
    dateInput = document.getElementById("post-csv-date"),
    salesPersonSelect = document.getElementById("select-sales-person"),
    postSuccess = document.getElementById("post-success"),
    noSalesTeam = document.getElementById("no-sales-team"),
    postAnother = document.getElementById("upload-another"),
    postPage = document.getElementById("posting-page"),
    loader = document.getElementById("loader"),
    mainContainer = document.getElementById("wrapper-container");

  function fetchSalesTeam() {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        salesPersonSelect.innerHTML = "";
        const salesTeamData = JSON.parse(xhr.responseText),
          optionInfo = document.createElement("option");
        optionInfo.classList.add("hidden");
        optionInfo.value = "";
        optionInfo.selected = true;
        optionInfo.disabled = true;
        optionInfo.innerHTML = "Select";
        salesPersonSelect.append(optionInfo);
        if (!salesTeamData.length) {
          noSalesTeam.classList.remove("hidden");
          postPage.classList.add("hidden");
          return;
        }
        salesTeamData.forEach((salesPersonnel) => {
          const salesPerson = document.createElement("option");
          salesPerson.value = salesPersonnel.sNo;
          salesPerson.innerHTML = salesPersonnel.salesPersonName;
          salesPersonSelect.append(salesPerson);
        });
      }
    };
    xhr.open("POST", "../backend.php", true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send("view-sales-team=1");
  }

  postAnother.addEventListener("click", () => {
    window.location.reload();
  });

  postNewButton.addEventListener("click", () => {
    const inputFileCSV = inputCSV.files[0],
      datedCSV = dateInput.value,
      salesPersonInput = salesPersonSelect.value;
    if (!inputFileCSV || datedCSV.trim() === "" || salesPersonInput === "") {
      messageShow.classList.remove("hidden");
      messageShow.innerText = "You have incomplete fields *";
      return;
    }
    loader.classList.remove("hidden");
    mainContainer.classList.add("hidden");
    postPage.classList.add("hidden");
    uploadAll();
  });

  function uploadCSVData() {
    const inputFileCSV = inputCSV.files[0],
      currentDate = new Date().toISOString().split("T")[0],
      currentTime = new Date().toLocaleTimeString().replace(/:/g, ""),
      randomNum = Math.floor(Math.random() * 1000),
      namedCSV = `${currentDate}_${currentTime}_${randomNum}.${getFileExtension(
        inputFileCSV.name
      )}`,
      formData = new FormData();
    formData.append("inputFileCSV", inputFileCSV, namedCSV);
    formData.append("saleDate", dateInput.value);
    formData.append("salesPersonID", salesPersonSelect.value);
    return formData;
  }

  function uploadAll() {
    const uploadCSVXHR = new XMLHttpRequest();
    uploadCSVXHR.onreadystatechange = function () {
      if (uploadCSVXHR.readyState === XMLHttpRequest.DONE) {
        if (uploadCSVXHR.responseText.includes("successfully")) {
          loader.classList.add("hidden");
          mainContainer.classList.remove("hidden");
          postPage.classList.add("hidden");
          postSuccess.classList.remove("hidden");
        } else {
          loader.classList.add("hidden");
          mainContainer.classList.remove("hidden");
          messageShow.classList.remove("hidden");
          postPage.classList.remove("hidden");
          messageShow.innerText = uploadCSVXHR.responseText;
        }
      }
    };
    uploadCSVXHR.open("POST", "../backend.php", true);
    uploadCSVXHR.send(uploadCSVData());
  }

  function getFileExtension(filename) {
    return filename.split(".").pop();
  }

  fetchSalesTeam();
});
