document.addEventListener("DOMContentLoaded", function () {
  const createCategory = document.getElementById("create-category-button"),
    categoryNameInput = document.getElementById("create-input-name"),
    categoryIDInput = document.getElementById("create-category-ID-input"),
    createCategoryMessage = document.getElementById("post-new-message"),
    createCategorySuccess = document.getElementById("post-new-success-message"),
    availableCategoryNoData = document.getElementById(
      "no-data-available-categories"
    ),
    availableCategoryTable = document.getElementById("view-category-table"),
    categoryChoose = document.getElementById("category-choose-pop-up"),
    closePopUp = document.getElementById("category-close"),
    articleImageInput = document.getElementById("article-image"),
    articleCaptureInput = document.getElementById("article-image-capture"),
    captureText = document.getElementById("camera-capture-text"),
    articleCTCInput = document.getElementById("article-CTC"),
    createArticleSubmit = document.getElementById("create-category-article"),
    articleCreationMandate = document.getElementById("no-success-ticking"),
    articleUploadForm = document.getElementById("article-upload-form"),
    articleUploadLoader = document.getElementById("article-upload-loader"),
    articleUploadSuccess = document.getElementById("article-upload-success"),
    articleImagePopUp = document.getElementById("articleImagePopUp"),
    modalImg = document.getElementById("article-image-src"),
    captionText = document.getElementById("article-image-view-CTC"),
    closeArticleImage = document.getElementsByClassName(
      "article-image-view-close"
    )[0],
    noArticleData = document.getElementById("no-data-available-articles"),
    categoryImagesGallery = document.getElementById("category-images-gallery"),
    viewArticlesWrapper = document.getElementById("wrapper-view-categories"),
    viewCategoryHeading = document.getElementById(
      "view-category-articles-heading"
    ),
    viewImageGallery = document.getElementById("view-image-gallery"),
    createArticleButton = document.getElementById("article-create-name");
  let imageEdit = false,
    articleEditID = "",
    articleEditCTC = "";
  closeArticleImage.addEventListener("click", () => {
    articleImagePopUp.classList.remove("show-pop-up");
    modalImg.src = "../images/shoe.gif";
    captionText.innerHTML = "Loading...";
  });

  function articleImagesCall(categoryNumber, categoryName) {
    const articleViewXHR = new XMLHttpRequest();
    articleViewXHR.onreadystatechange = () => {
      if (articleViewXHR.readyState === XMLHttpRequest.DONE) {
        const imagesInfo = JSON.parse(articleViewXHR.responseText);
        viewCategoryHeading.innerText = `${categoryName} Articles`;
        viewImageGallery.classList.remove("article-view-three-set");
        viewImageGallery.classList.remove("article-view-four-set");
        if (imagesInfo.length) {
          noArticleData.classList.add("hidden");
          articleImageGallery(imagesInfo);
        } else {
          noArticleData.classList.remove("hidden");
          categoryImagesGallery.classList.add("hidden");
        }
        viewArticlesWrapper.classList.remove("hidden");
      }
    };
    articleViewXHR.open("POST", "../backend.php", true);
    articleViewXHR.setRequestHeader(
      "Content-type",
      "application/x-www-form-urlencoded"
    );
    articleViewXHR.send(`view-article-images=${categoryNumber}`);
  }

  closePopUp.addEventListener("click", () => {
    popUpClose();
  });

  createCategory.addEventListener("click", () => {
    viewArticlesWrapper.classList.add("hidden");
    if (
      categoryNameInput.value.trim() === "" ||
      categoryIDInput.value.trim() === ""
    ) {
      createCategoryMessage.innerHTML =
        "Category creation parameters should not be empty";
      createCategorySuccess.classList.add("hidden");
      createCategoryMessage.classList.remove("hidden");
      return;
    }
    createCategoryRequest(
      categoryNameInput.value.trimEnd(),
      categoryIDInput.value
    );
  });

  categoryNameInput.addEventListener("keyup", () => {
    categoryNameInput.value = categoryNameInput.value
      .replace(/^\s+|^\-|^\_/g, "")
      .replace(/[^a-zA-Z0-9\s\-\_]/g, "");
    createCategoryMessage.classList.add("hidden");
    createCategorySuccess.classList.add("hidden");
  });

  categoryNameInput.addEventListener("keydown", () => {
    createCategoryMessage.classList.add("hidden");
    createCategorySuccess.classList.add("hidden");
  });

  categoryIDInput.addEventListener("keyup", () => {
    categoryIDInput.value = categoryIDInput.value
      .replace(/\s/g, "")
      .replace(/[^a-zA-Z0-9]/g, "");
    createCategoryMessage.classList.add("hidden");
    createCategorySuccess.classList.add("hidden");
  });

  categoryIDInput.addEventListener("keydown", () => {
    categoryIDInput.value = categoryIDInput.value
      .replace(/\s/g, "")
      .replace(/[^a-zA-Z0-9]/g, "");
    createCategoryMessage.classList.add("hidden");
    createCategorySuccess.classList.add("hidden");
  });

  createArticleSubmit.addEventListener("click", () => {
    if (
      !articleImageInput.files[0] &&
      !articleCaptureInput.files[0] &&
      !imageEdit
    ) {
      articleCreationMandate.innerHTML = "Image is required to create Article";
      articleCreationMandate.classList.remove("hidden");
      return;
    }
    if (articleCTCInput.value === "" && !imageEdit) {
      articleCreationMandate.innerHTML = "CTC is required to create Article";
      articleCreationMandate.classList.remove("hidden");
      return;
    }
    uploadArticleImage();
  });

  articleImageInput.addEventListener("change", () => {
    articleCreationMandate.classList.add("hidden");
    articleCaptureInput.value = "";
    if (articleImageInput.files[0]) captureText.classList.add("hidden");
  });

  articleCaptureInput.addEventListener("change", () => {
    articleCreationMandate.classList.add("hidden");
    articleImageInput.value = "";
    if (articleCaptureInput.files[0]) captureText.classList.remove("hidden");
    else captureText.classList.add("hidden");
  });

  articleCTCInput.addEventListener("keyup", () => {
    articleCreationMandate.classList.add("hidden");
  });

  function popUpClose() {
    categoryChoose.classList.remove("category-motion");
    setTimeout(() => {
      categoryChoose.classList.add("hidden");
    }, 300);
  }

  function uploadArticleData() {
    articleUploadForm.classList.add("hidden");
    articleUploadLoader.classList.remove("hidden");
    const galleryImage =
        articleImageInput.value !== ""
          ? articleImageInput.files[0]
          : articleCaptureInput.files[0],
      currentDate = new Date().toISOString().split("T")[0],
      currentTime = new Date().toLocaleTimeString().replace(/:/g, ""),
      randomNum = Math.floor(Math.random() * 1000),
      imageName = `${currentDate}_${currentTime}_${randomNum}.${getFileExtension(
        galleryImage.name
      )}`,
      uploadArticleData = new FormData(),
      categoryNumber = document.getElementById(
        `category_${closePopUp.className}`
      ).childNodes[0].className;
    uploadArticleData.append("galleryImage", galleryImage, imageName);
    uploadArticleData.append("articleCTC", articleCTCInput.value);
    uploadArticleData.append("articleNumber", closePopUp.className);
    uploadArticleData.append("categoryNumber", categoryNumber);
    return uploadArticleData;
  }

  function uploadArticleEditData() {
    articleUploadForm.classList.add("hidden");
    articleUploadLoader.classList.remove("hidden");
    const galleryImage =
        articleImageInput.value !== ""
          ? articleImageInput.files[0]
          : articleCaptureInput.value !== ""
          ? articleCaptureInput.files[0]
          : "",
      currentDate = new Date().toISOString().split("T")[0],
      currentTime = new Date().toLocaleTimeString().replace(/:/g, ""),
      randomNum = Math.floor(Math.random() * 1000),
      imageName =
        articleImageInput.value === "" && articleCaptureInput.value === ""
          ? ""
          : `${currentDate}_${currentTime}_${randomNum}.${getFileExtension(
              galleryImage.name
            )}`,
      uploadArticleData = new FormData();
    if (articleImageInput.value !== "" || articleCaptureInput.value !== "")
      uploadArticleData.append("galleryImage", galleryImage, imageName);
    uploadArticleData.append("articleCTC", articleCTCInput.value);
    uploadArticleData.append("articleEditNumber", articleEditID);
    return uploadArticleData;
  }

  function uploadArticleImage() {
    const articleXHRRequest = new XMLHttpRequest();
    articleXHRRequest.onreadystatechange = function () {
      if (articleXHRRequest.readyState === XMLHttpRequest.DONE) {
        if (articleXHRRequest.responseText.includes("successfully")) {
          articleUploadLoader.classList.add("hidden");
          articleUploadSuccess.classList.remove("hidden");
          viewArticlesWrapper.classList.add("hidden");
          setTimeout(() => {
            popUpClose();
            fetchAvailableCategories();
          }, 3000);
        } else {
          articleUploadLoader.classList.add("hidden");
          articleUploadForm.classList.remove("hidden");
          articleCreationMandate.innerHTML = articleXHRRequest.responseText;
          articleCreationMandate.classList.remove("hidden");
        }
      }
    };
    articleXHRRequest.open("POST", "../backend.php", true);
    articleXHRRequest.send(
      imageEdit ? uploadArticleEditData() : uploadArticleData()
    );
  }

  function createCategoryRequest(categoryName, categoryID) {
    const createCategoryXHR = new XMLHttpRequest(),
      createCategoryFormData = new FormData();
    createCategoryXHR.onreadystatechange = () => {
      if (createCategoryXHR.readyState === XMLHttpRequest.DONE) {
        if (createCategoryXHR.responseText.includes("successfully")) {
          categoryNameInput.value = "";
          categoryIDInput.value = "";
          createCategorySuccess.innerHTML = createCategoryXHR.responseText;
          createCategorySuccess.classList.remove("hidden");
          fetchAvailableCategories();
        } else {
          createCategoryMessage.innerHTML = createCategoryXHR.responseText;
          createCategorySuccess.classList.add("hidden");
          createCategoryMessage.classList.remove("hidden");
        }
      }
    };
    createCategoryFormData.append("chosen-category-name", categoryName);
    createCategoryFormData.append("chosen-category-ID", categoryID);
    createCategoryXHR.open("POST", "../backend.php", true);
    createCategoryXHR.send(createCategoryFormData);
  }

  function fetchAvailableCategories() {
    const availableCategoriesXHR = new XMLHttpRequest();
    availableCategoriesXHR.onreadystatechange = () => {
      if (availableCategoriesXHR.readyState === XMLHttpRequest.DONE) {
        categoryDataAllocation(JSON.parse(availableCategoriesXHR.responseText));
      }
    };
    availableCategoriesXHR.open("POST", "../backend.php", true);
    availableCategoriesXHR.setRequestHeader(
      "Content-type",
      "application/x-www-form-urlencoded"
    );
    availableCategoriesXHR.send("view-available-categories=1");
  }

  function categoryDataAllocation(categoryData) {
    if (!categoryData.length) {
      availableCategoryNoData.classList.remove("hidden");
      availableCategoryTable.classList.add("hidden");
      return;
    } else {
      availableCategoryNoData.classList.add("hidden");
      availableCategoryTable.classList.remove("hidden");
      availableCategoryTable.innerHTML = "";
      categoryTableCreation(categoryData);
      chooseArticles();
    }
  }

  function categoryTableCreation(categoryData) {
    const categoryNumbers = [];
    let availableCategoryHTML = `<tr><th>#</th><th>Category Name</th><th>Choose IDs</th></tr>`;
    categoryData.forEach((currentRow, currentIndex) => {
      const categoryIDs = JSON.parse(currentRow.chosenCategories),
        categoryChooseButtons = categoryIDsGeneration(categoryIDs, currentRow);
      availableCategoryHTML += `<tr><td>${
        currentIndex + 1
      }</td><td><a href="#_" id="categoryNumber_${currentRow.sNo}">${
        currentRow.categoryName
      }</a></td><td>${categoryChooseButtons}</td></tr>`;
      categoryNumbers.push(currentRow.sNo);
    });
    availableCategoryTable.innerHTML = availableCategoryHTML;
    viewArticleImages(categoryNumbers);
  }

  function categoryIDsGeneration(categoryIDs, currentRow) {
    const newCategoryIDs = [];
    let currentID = 1;
    while (newCategoryIDs.length !== 5) {
      if (
        currentID < 10 &&
        !categoryIDs.includes(`${currentRow.categoryID}0${currentID}`)
      )
        newCategoryIDs.push(`${currentRow.categoryID}0${currentID}`);
      else if (
        currentID >= 10 &&
        !categoryIDs.includes(`${currentRow.categoryID}${currentID}`)
      )
        newCategoryIDs.push(`${currentRow.categoryID}${currentID}`);
      currentID++;
    }
    return chosenIDsButtonsHTML(newCategoryIDs, currentRow.sNo);
  }

  function chosenIDsButtonsHTML(newCategoryIDs, sNo) {
    return newCategoryIDs.reduce((accumulatedHTML, currentID) => {
      return (
        accumulatedHTML +
        `<div class="category-choose-button choose-created-ID" id="category_${currentID}"><button class="${sNo}">${currentID}</button></div>`
      );
    }, ``);
  }

  function viewArticleImages(categoryNumbers) {
    for (let index = 0; index < categoryNumbers.length; index++) {
      const currentCategory = document.getElementById(
        `categoryNumber_${categoryNumbers[index]}`
      );
      currentCategory.addEventListener("click", () => {
        articleImagesCall(categoryNumbers[index], currentCategory.innerText);
      });
    }
  }

  function chooseArticles() {
    const articleButtons = document.getElementsByClassName("choose-created-ID");
    for (let index = 0; index < articleButtons.length; index++) {
      articleButtons[index].addEventListener(
        "click",
        () => {
          imageEdit = false;
          chooseArticlesHideOut();
          closePopUp.classList.add(
            articleButtons[index].getAttribute("id").replace("category_", "")
          );
          articleUploadForm.classList.remove("hidden");
          setTimeout(() => {
            categoryChoose.classList.add("category-motion");
          }, 0);
          categoryChoose.classList.remove("hidden");
        },
        false
      );
    }
  }

  function chooseArticlesHideOut() {
    if (imageEdit) createArticleButton.innerHTML = "Finalize Edit";
    else createArticleButton.innerHTML = "Create Article";
    if (!imageEdit) viewArticlesWrapper.classList.add("hidden");
    captureText.classList.add("hidden");
    createCategoryMessage.classList.add("hidden");
    createCategorySuccess.classList.add("hidden");
    articleCreationMandate.classList.add("hidden");
    articleUploadSuccess.classList.add("hidden");
    articleUploadLoader.classList.add("hidden");
    articleCaptureInput.value = "";
    articleImageInput.value = "";
    articleCTCInput.value = imageEdit ? articleEditCTC : "";
    closePopUp.className = "";
  }

  function articleImageGallery(imagesInfo) {
    let articleCards = ``;
    imagesInfo.forEach((currentImageInfo) => {
      articleCards += `<a href="#" class="article-image-card"><img src="../uploads/${currentImageInfo.imageName}"/><div class="category-article-image-ID">Article ID: ${currentImageInfo.articleNumber}</div><div class="category-article-image-CTC">CTC: ${currentImageInfo.CTC}</div><div class="edit-images"><div class="edit-feature-wrapper"><div class="button-wrapper"><div class="edit-buttons"><button class="edit image-edit" type="button" data-attribute="${currentImageInfo.articleNumber}|${currentImageInfo.CTC}"><span class="edit-icon"></span><span>Edit</span></button></div><div class="button-wrapper"><button type="button" class="edit view" onclick="window.open('../uploads/${currentImageInfo.imageName}', '_blank');">View</button></div></div></div></div></a>`;
    });
    categoryImagesGallery.innerHTML = articleCards;
    categoryImagesGallery.classList.remove("hidden");
    if (imagesInfo.length === 3)
      viewImageGallery.classList.add("article-view-three-set");
    if (imagesInfo.length > 3)
      viewImageGallery.classList.add("article-view-four-set");
    editImages();
  }

  function editImages() {
    const editOptions = document.getElementsByClassName("image-edit");
    for (let index = 0; index < editOptions.length; index++) {
      editOptions[index].addEventListener(
        "click",
        () => {
          imageEdit = true;
          const editProperies = editOptions[index]
            .getAttribute("data-attribute")
            .split("|");
          articleEditID = editProperies[0];
          articleEditCTC = editProperies[1];
          chooseArticlesHideOut();
          articleUploadForm.classList.remove("hidden");
          setTimeout(() => {
            categoryChoose.classList.add("category-motion");
          }, 0);
          categoryChoose.classList.remove("hidden");
        },
        false
      );
    }
  }

  function getFileExtension(filename) {
    return filename.split(".").pop();
  }

  fetchAvailableCategories();
});
