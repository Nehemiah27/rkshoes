document.addEventListener("DOMContentLoaded", function () {
  const createPersonButton = document.getElementById("create-new-sales-person"),
    personCreateWidget = document.getElementById("person-creation"),
    personCreateError = document.getElementById("empty-person-error"),
    personInput = document.getElementById("new-person"),
    newPersonSubmit = document.getElementById("new-person-submit"),
    personCreateSuccess = document.getElementById("new-person-create-success"),
    viewPersonButton = document.getElementById("view-persons"),
    personViewList = document.getElementById("person-view"),
    personViewTable = document.getElementById("view-person-table");

  createPersonButton.addEventListener("click", () => {
    personInput.value = "";
    personCreateWidget.classList.remove("hidden");
    createPersonButton.classList.add("hidden");
    personCreateSuccess.classList.add("hidden");
    viewPersonButton.classList.remove("hidden");
    personViewList.classList.add("hidden");
  });

  viewPersonButton.addEventListener("click", () => {
    personViewList.classList.remove("hidden");
    viewPersonButton.classList.add("hidden");
    createPersonButton.classList.remove("hidden");
    personCreateWidget.classList.add("hidden");
    personCreateSuccess.classList.add("hidden");
    personCreateError.classList.add("hidden");
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE)
        tableRender(xhr).forEach((deleteId) => {
          deleteFunctionality(`person_button_${deleteId}`);
        });
    };
    xhr.open("POST", "../backend.php", true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send("view-sales-team=1");
  });

  function deleteFunctionality(personSNo) {
    const deleteButton = document.getElementById(personSNo);
    deleteButton.addEventListener("click", () => {
      const xhrDelete = new XMLHttpRequest();
      xhrDelete.onreadystatechange = () => {
        if (xhrDelete.readyState === XMLHttpRequest.DONE)
          tableRender(xhrDelete).forEach((deleteId) => {
            deleteFunctionality(`person_button_${deleteId}`);
          });
      };
      xhrDelete.open("POST", "../backend.php", true);
      xhrDelete.setRequestHeader(
        "Content-type",
        "application/x-www-form-urlencoded"
      );
      xhrDelete.send(
        "deleteSalesPersonSno=" +
          encodeURIComponent(personSNo.replaceAll("person_button_", ""))
      );
    });
  }

  function tableRender(xhr) {
    const salesTeamData = JSON.parse(xhr.responseText),
      deleteButtons = [];
    personViewTable.innerHTML = salesTeamData.length
      ? `<tr><th>#</th><th>Sales Person Name</th><th>Actions</th></tr>`
      : "No Data. Please recruit new Sales Team";
    salesTeamData.forEach((currentData, personIndex) => {
      const li = document.createElement("tr");
      li.innerHTML = `<td>${personIndex + 1}</td><td>${
        currentData.salesPersonName
      }</td><td><button id="person_button_${
        currentData.sNo
      }" class="delete-button">Delete</button></td>`;
      personViewTable.appendChild(li);
      deleteButtons.push(currentData.sNo);
    });
    return deleteButtons;
  }

  newPersonSubmit.addEventListener("click", () => {
    if (personInput.value.trim() === "") {
      personCreateError.classList.remove("hidden");
      personCreateSuccess.classList.add("hidden");
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        personCreateSuccess.innerText = xhr.responseText;
        personCreateSuccess.classList.remove("hidden");
      }
      if (xhr.responseText.includes("successfully")) {
        personInput.value = "";
        personCreateSuccess.classList.add("success");
        personCreateSuccess.classList.remove("not-success");
      } else {
        personCreateSuccess.classList.add("not-success");
        personCreateSuccess.classList.remove("success");
      }
    };
    xhr.open("POST", "../backend.php", true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send("newSalesPerson=" + encodeURIComponent(personInput.value));
  });

  personInput.addEventListener("input", () => {
    if (personInput.value.trim() !== "")
      personCreateError.classList.add("hidden");
  });
});
