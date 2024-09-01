<?php
$envFile = __DIR__ . '/.env';
$lines = file( $envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES );
foreach ( $lines as $line ) {
    list( $key, $value ) = explode( '=', $line, 2 );
    $key = trim( $key );
    $value = trim( $value );
    putenv( "$key=$value" );
}
$server = getenv( 'DB_SERVER' );
$username = getenv( 'DB_USERNAME' );
$password = getenv( 'DB_PASSWORD' );
$database = getenv( 'DB_DATABASE' );
$con = mysqli_connect( $server, $username, $password, $database );
if ( !$con ) die( 'connection to this database failed due to' . mysqli_connect_error() );
if ( $_SERVER[ 'REQUEST_METHOD' ] === 'POST' && isset( $_POST[ 'view-sales-team' ] ) ) {
    $result = $con->query( 'SELECT sNo, salesPersonName FROM salesteam' );
    $salesTeamData = array();
    while ( $row = $result->fetch_assoc() ) {
        $salesTeamData[] = $row;
    }
    echo json_encode( $salesTeamData );
    $con->close();
} else if ( $_SERVER[ 'REQUEST_METHOD' ] === 'POST' && isset( $_POST[ 'newSalesPerson' ] ) ) {
    $newSalesPerson = $_POST[ 'newSalesPerson' ];
    $checkSQL = "SELECT COUNT(*) FROM `salesteam` WHERE `salesPersonName` = '$newSalesPerson'";
    $result = $con->query( $checkSQL );
    if ( $result ) {
        $row = $result->fetch_assoc();
        $count = $row[ 'COUNT(*)' ];
        if ( $count === '0' ) {
            $sql = "INSERT INTO `salesteam` (`salesPersonName`) VALUES ('$newSalesPerson');";
            if ( $con->query( $sql ) === true )
            echo "New Sales Person '$newSalesPerson' successfully created!";
            else
            echo 'Error: ' . $sql . '<br>' . $con->error;
        } else
        echo "Sales Person '$newSalesPerson' already exists in the database.";
    } else
    echo 'Error checking for existing Sales Team: ' . $con->error;
    $con->close();
} else if ( $_SERVER[ 'REQUEST_METHOD' ] === 'POST' && isset( $_POST[ 'deleteSalesPersonSno' ] ) ) {
    $deleteSno = $_POST[ 'deleteSalesPersonSno' ];
    $deleteSQL = "DELETE FROM `salesteam` WHERE `sNo` = '$deleteSno'";
    if ( $con->query( $deleteSQL ) === true ) {
        $selectSQL = 'SELECT sNo, salesPersonName FROM salesteam';
        $result = $con->query( $selectSQL );
        if ( $result ) {
            $salesTeamData = array();
            while ( $row = $result->fetch_assoc() ) {
                $salesTeamData[] = $row;
            }
            echo json_encode( $salesTeamData );
        }
    } else
    echo 'Error deleting Sales Person: ' . $con->error;
    $con->close();
} else if ( $_SERVER[ 'REQUEST_METHOD' ] === 'POST' && isset( $_FILES[ 'inputFileCSV' ] ) ) {
    $date = $_POST[ 'saleDate' ];
    $salesPersonID = $_POST[ 'salesPersonID' ];
    $targetDirectory = 'uploads/';
    $targetFile = $targetDirectory . basename( $_FILES[ 'inputFileCSV' ][ 'name' ] );
    $customCSVName = $_FILES[ 'inputFileCSV' ][ 'name' ];
    if ( !file_exists( $targetDirectory ) )
    mkdir( $targetDirectory, 0777, true );
    move_uploaded_file( $_FILES[ 'inputFileCSV' ][ 'tmp_name' ],
    $targetDirectory . $customCSVName );
    $csvFile = 'uploads/' . $_FILES[ 'inputFileCSV' ][ 'name' ];
    $salesData = array();
    if ( ( $handle = fopen( $csvFile, 'r' ) ) !== FALSE ) {
        $headers = fgetcsv( $handle );
        if ( in_array( 'productIdentity', $headers ) && in_array( 'salePrice', $headers ) ) {
            while ( ( $data = fgetcsv( $handle ) ) !== FALSE ) {
                $rowData = array_combine( $headers, $data );
                $salesData[] = $rowData[ 'productIdentity' ];
                $salesData[] = $rowData[ 'salePrice' ];
            }
        } else {
            deleteFile( $targetDirectory . $customCSVName );
            echo 'Incorrect CSV Format';
            fclose( $handle );
            $con->close();
            return;
        }
        fclose( $handle );
    } else {
        echo 'Unable to open the CSV file.';
        deleteFile( $targetDirectory . $customCSVName );
        $con->close();
        return;
    }
    if ( count( $salesData ) === 0 ) {
        deleteFile( $targetDirectory . $customCSVName );
        echo 'No data found in the uploaded file';
        $con->close();
        return;
    }
    $productsInfo = array();
    $availableProducts = 'SELECT productIdentity FROM productdata';
    $productResults = mysqli_query( $con, $availableProducts );
    while ( $row = mysqli_fetch_assoc( $productResults ) ) {
        $productsInfo[] = $row[ 'productIdentity' ];
    }
    for ( $i = 0; $i < count( $salesData );
    $i += 2 ) {
        $productIdentity = mysqli_real_escape_string( $con, $salesData[ $i ] );
        $salePrice = mysqli_real_escape_string( $con, $salesData[ $i + 1 ] );
        $query = "INSERT INTO salesdata (saleDate, salesPersonId, productIdentity, salePrice) VALUES ('$date', '$salesPersonID', '$productIdentity', '$salePrice')";
        mysqli_query( $con, $query );
        if ( !in_array( $productIdentity, $productsInfo ) ) {
            $productsInfo[] = $productIdentity;
            $newProductInsert = "INSERT INTO productdata (productIdentity) VALUES ('$productIdentity')";
            mysqli_query( $con, $newProductInsert );
        }
    }
    deleteFile( $targetDirectory . $customCSVName );
    echo 'New Post successfully saved';
    $con->close();
} else if ( $_SERVER[ 'REQUEST_METHOD' ] === 'POST' && isset( $_POST[ 'productInfo' ] ) ) {
    $productsData = $con->query( 'SELECT sNo, productIdentity, companyName, ctc, lastPrice, gender, brand, articleNumber, category, mrp FROM productdata' );
    $productSummary = array();
    while ( $row = $productsData->fetch_assoc() ) {
        $productSummary[] = $row;
    }
    echo json_encode( $productSummary );
    $con->close();
} else if ( $_SERVER[ 'REQUEST_METHOD' ] === 'POST' && isset( $_POST[ 'current-product-sNo' ] ) ) {
    $currentSNo = $_POST[ 'current-product-sNo' ];
    $productsData = $con->query( "SELECT sNo, productIdentity, companyName, ctc, lastPrice, gender, brand, articleNumber, category, mrp FROM productdata WHERE `sNo` = '$currentSNo'" );
    $productSummary = array();
    while ( $row = $productsData->fetch_assoc() ) {
        $productSummary[] = $row;
    }
    echo json_encode( $productSummary );
    $con->close();
} else if ( $_SERVER[ 'REQUEST_METHOD' ] === 'POST' && isset( $_POST[ 'update-product-sNo' ] ) ) {
    $currentSNo = $_POST[ 'update-product-sNo' ];
    $companyName = $_POST[ 'companyName' ];
    $brandName = $_POST[ 'brand' ];
    $gender = $_POST[ 'gender' ];
    $articleNumber = $_POST[ 'articleNumber' ];
    $category = $_POST[ 'category' ];
    $ctc = $_POST[ 'ctc' ];
    $lastPrice = $_POST[ 'lastPrice' ];
    $mrp = $_POST[ 'mrp' ];
    $productsUpdate = $con->query( "UPDATE productdata SET companyName = '$companyName', brand = '$brandName', gender = '$gender', articleNumber = '$articleNumber', category = '$category', ctc = '$ctc', lastPrice = '$lastPrice', mrp = '$mrp' WHERE `sNo` = '$currentSNo'" );
    if ( $productsUpdate === true )echo 'product info updated successfully';
    else echo 'internal server error';
    $con->close();
} else if ( $_SERVER[ 'REQUEST_METHOD' ] === 'POST' && isset( $_POST[ 'chosen-category-name' ] ) ) {
    $newCategoryName = $_POST[ 'chosen-category-name' ];
    $newCategoryID = $_POST[ 'chosen-category-ID' ];
    $checkCategory = "SELECT COUNT(*) FROM `categorydata` WHERE `categoryName` = '$newCategoryName'";
    $categoryStatus = $con->query( $checkCategory );
    if ( $categoryStatus ) {
        $categoryAvailability = $categoryStatus->fetch_assoc();
        $categoryCount = $categoryAvailability[ 'COUNT(*)' ];
        if ( $categoryCount !== '0' ) {
            echo "Chosen category '$newCategoryName' already exists in the database.";
            $con->close();
            return;
        }
    } else {
        echo 'Error checking for existing Category Name: ' . $con->error;
        $con->close();
        return;
    }
    $checkCategoryID = "SELECT COUNT(*) FROM `categorydata` WHERE `categoryID` = '$newCategoryID'";
    $categoryIDStatus = $con->query( $checkCategoryID );
    if ( $categoryIDStatus ) {
        $categoryIDAvailability = $categoryIDStatus->fetch_assoc();
        $categoryIDCount = $categoryIDAvailability[ 'COUNT(*)' ];
        if ( $categoryIDCount !== '0' ) {
            echo "Chosen categoryID '$newCategoryID' already exists in the database.";
            $con->close();
            return;
        }
    } else {
        echo 'Error checking for existing Category Name: ' . $con->error;
        $con->close();
        return;
    }
    $newCategorySQL =  "INSERT INTO categorydata (categoryName, categoryID, chosenCategories) VALUES ('$newCategoryName', '$newCategoryID', '[]');";
    if ( $con->query( $newCategorySQL ) === true ) echo 'New Category created successfully';
    else 'Error: '. $newCategorySQL . '<br>' . $con->error;
    $con->close();
} else if ( $_SERVER[ 'REQUEST_METHOD' ] === 'POST' && isset( $_POST[ 'view-available-categories' ] ) ) {
    $availableCategoriesSQL = $con->query( 'SELECT sNo, categoryName, categoryID, chosenCategories FROM categorydata' );
    $availableCategories = array();
    while( $row = $availableCategoriesSQL->fetch_assoc() ) {
        $availableCategories[] = $row;
    }
    echo json_encode( $availableCategories );
    $con->close();
} else if ( $_SERVER[ 'REQUEST_METHOD' ] === 'POST'  &&  isset( $_FILES[ 'galleryImage' ] ) && isset( $_POST[ 'articleNumber' ] ) ) {
    $categoryNumber = $_POST[ 'categoryNumber' ];
    $articleCTC = $_POST[ 'articleCTC' ];
    $articleNumber = $_POST[ 'articleNumber' ];
    $targetDirectory = 'uploads/';
    if ( !file_exists( $targetDirectory ) )
    mkdir( $targetDirectory, 0777, true );
    $targetFile = $targetDirectory . basename( $_FILES[ 'galleryImage' ][ 'name' ] );
    $customImageName = $_FILES[ 'galleryImage' ][ 'name' ];
    move_uploaded_file( $_FILES[ 'galleryImage' ][ 'tmp_name' ],
    $targetDirectory . $customImageName );
    $articleDataSQL = "INSERT INTO articledata (articleNumber, CTC, imageName, categoryNumber) VALUES ('$articleNumber','$articleCTC','$customImageName', '$categoryNumber')";
    $currentCategory = $con->query( "SELECT chosenCategories FROM categorydata WHERE `sNo` = '$categoryNumber'" );
    $currentCategoryData = array();
    while( $row = $currentCategory->fetch_assoc() ) {
        $currentCategoryData[] = $row;
    }
    $currentArticles = json_decode( $currentCategoryData[ 0 ][ 'chosenCategories' ] );
    $currentArticles[] = $articleNumber;
    $updatedArticles = json_encode( $currentArticles );
    $categoriesUpdate = "UPDATE categorydata SET chosenCategories = '$updatedArticles' WHERE sNo = '$categoryNumber'";
    if ( $con->query( $categoriesUpdate ) !== true ) {
        echo 'Server is busy at the moment.';
        $con->close();
        return;
    }
    if ( $con->query( $articleDataSQL ) === true )
    echo 'New Article successfully saved';
    else echo 'Error: ' . $articleDataSQL . '<br>' . $con->error;
    $con->close();
} else if ( $_SERVER[ 'REQUEST_METHOD' ] === 'POST' && isset( $_POST[ 'articleEditNumber' ] ) ) {
    $updateStatus = false;
    $articleCTC = $_POST[ 'articleCTC' ] === ''?0:$_POST[ 'articleCTC' ];
    $articleID = $_POST[ 'articleEditNumber' ];
    $targetDirectory = 'uploads/';
    if ( !file_exists( $targetDirectory ) )
    mkdir( $targetDirectory, 0777, true );
    if ( isset( $_FILES[ 'galleryImage' ] ) ) {
        $targetFile = $targetDirectory . basename( $_FILES[ 'galleryImage' ][ 'name' ] );
        $customImageName = $_FILES[ 'galleryImage' ][ 'name' ];
        move_uploaded_file( $_FILES[ 'galleryImage' ][ 'tmp_name' ],
        $targetDirectory . $customImageName );
        $updateStatus =  $con->query( "UPDATE articledata SET CTC = '$articleCTC', imageName = '$customImageName' WHERE `articleNumber` = '$articleID'" );
    } else
    $updateStatus = $con->query( "UPDATE articledata SET CTC = '$articleCTC' WHERE `articleNumber` = '$articleID'" );
    if ( $updateStatus === true )
    echo 'Article edited successfully';
    else echo 'Error: ' . $updateStatus . '<br>' . $con->error;
    $con->close();
} else if ( $_SERVER[ 'REQUEST_METHOD' ] === 'POST'  &&  isset( $_POST[ 'view-article-images' ] ) ) {
    $categoryNumber = $_POST[ 'view-article-images' ];
    $viewArticleSQL = $con->query( "SELECT CTC, imageName, articleNumber FROM articledata WHERE `categoryNumber` = '$categoryNumber'" );
    $availableImageData = array();
    while( $row = $viewArticleSQL->fetch_assoc() ) {
        $availableImageData[] = $row;
    }
    echo json_encode( $availableImageData );
    $con->close();
} else {
    http_response_code( 405 );
    echo 'Method Not Allowed';
    $con->close();
}

function deleteFile( $filePath ) {
    if ( file_exists( $filePath ) ) unlink( $filePath );
}
?>