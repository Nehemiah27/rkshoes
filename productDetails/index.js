document.addEventListener("DOMContentLoaded", function () {
  const xhr = new XMLHttpRequest(),
    productTable = document.getElementById("view-products-table"),
    productView = document.getElementById("product-view"),
    noProducts = document.getElementById("no-products-info"),
    productHeading = document.getElementById("product-heading"),
    companyInput = document.getElementById("configure-company-name"),
    brandInput = document.getElementById("configure-brand-name"),
    genderInput = document.getElementById("configure-gender"),
    articleInput = document.getElementById("configure-article-number"),
    categoryInput = document.getElementById("configure-category"),
    inputCTC = document.getElementById("configure-CTC"),
    inputLastPrice = document.getElementById("configure-last-price"),
    inputMRP = document.getElementById("configure-MRP"),
    updateProducts = document.getElementById("update-configuration"),
    backButton = document.getElementById("back-to-configure"),
    configureProduct = document.getElementById("configure-product");
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE)
      tableRender(xhr).forEach((deleteId) => {
        editFunctionality(`edit_button_${deleteId}`);
      });
  };
  xhr.open("POST", "../backend.php", true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.send("productInfo=1");

  backButton.addEventListener("click", () => {
    productView.classList.remove("hidden");
    configureProduct.classList.add("hidden");
  });

  updateProducts.addEventListener("click", () => {
    const productUpdates = new FormData();
    productUpdates.append("update-product-sNo", backButton.className);
    productUpdates.append("companyName", companyInput.value);
    productUpdates.append("brand", brandInput.value);
    productUpdates.append("gender", genderInput.value);
    productUpdates.append("articleNumber", articleInput.value);
    productUpdates.append("category", categoryInput.value);
    productUpdates.append("ctc", inputCTC.value);
    productUpdates.append("lastPrice", inputLastPrice.value);
    productUpdates.append("mrp", inputMRP.value);
    const xhrUpdate = new XMLHttpRequest();
    xhrUpdate.onreadystatechange = function () {
      if (xhrUpdate.readyState === XMLHttpRequest.DONE) {
        if (xhrUpdate.responseText.includes("successfully"))
          window.location.reload();
        else {
        }
      }
    };
    xhrUpdate.open("POST", "../backend.php", true);
    xhrUpdate.send(productUpdates);
  });

  function tableRender(xhr) {
    const productsData = JSON.parse(xhr.responseText);
    if (!productsData.length) {
      noProducts.classList.remove("hidden");
      productView.classList.add("hidden");
      return [];
    }
    productTable.innerHTML = `<tr><th>#</th><th>Product Identity</th><th>Company Name</th><th>Brand</th><th>Gender</th><th>Article Number</th><th>Category</th><th>CTC</th><th>Last Price</th><th>MRP</th><th>Actions</th></tr>`;
    noProducts.classList.add("hidden");
    productView.classList.remove("hidden");
    return tabularData(productsData);
  }

  function tabularData(productsData) {
    const deleteButtons = [];
    productsData.forEach((currentData, productIndex) => {
      const li = document.createElement("tr");
      li.innerHTML = `<td>${productIndex + 1}</td><td>${
        currentData.productIdentity
      }</td><td>${currentData.companyName}</td><td>${
        currentData.brand
      }</td><td>${currentData.gender}</td><td>${
        currentData.articleNumber
      }</td><td>${currentData.category}</td><td>${currentData.ctc}</td><td>${
        currentData.lastPrice
      }</td><td>${currentData.mrp}</td>
      <td><button id="edit_button_${
        currentData.sNo
      }" class="edit-button">Edit</button></td>`;
      productTable.appendChild(li);
      deleteButtons.push(currentData.sNo);
    });
    return deleteButtons;
  }

  function editFunctionality(productSNo) {
    const editButton = document.getElementById(productSNo);
    editButton.addEventListener("click", () => {
      const xhrEdit = new XMLHttpRequest();
      xhrEdit.onreadystatechange = () => {
        if (xhrEdit.readyState === XMLHttpRequest.DONE)
          enableEdit(JSON.parse(xhrEdit.responseText)[0]);
      };
      xhrEdit.open("POST", "../backend.php", true);
      xhrEdit.setRequestHeader(
        "Content-type",
        "application/x-www-form-urlencoded"
      );
      xhrEdit.send(
        "current-product-sNo=" +
          encodeURIComponent(productSNo.replaceAll("edit_button_", ""))
      );
    });
  }

  function enableEdit(fieldData) {
    productView.classList.add("hidden");
    configureProduct.classList.remove("hidden");
    backButton.className = "";
    backButton.classList.add(fieldData.sNo);
    productHeading.innerHTML = fieldData.productIdentity;
    companyInput.value = fieldData.companyName;
    brandInput.value = fieldData.brand;
    genderInput.value = fieldData.gender;
    articleInput.value = fieldData.articleNumber;
    categoryInput.value = fieldData.category;
    inputCTC.value = fieldData.ctc;
    inputLastPrice.value = fieldData.lastPrice;
    inputMRP.value = fieldData.mrp;
  }
});
