
function init() {
    initFakeContacts();
    renderGridLocal();
}

function initFakeContacts() {
    var contacts = [{
        "phone": "+1234567",
        "name": "Test Name",
        "place": "Sofia",
        "gender": "Male",
        "sign": "3",
        "notes": "Some notes"
    }, {
        "phone": "0555666",
        "name": "Test Name 2",
        "place": "World",
        "gender": "Female"
    }, {
        "phone": "0999888777",
        "name": "Test Name 3",
        "place": "",
        "gender": "Female",
        notes: "123456"
    }];
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

function renderGridFiltered(contacts) {

    var tdata = document.getElementById("tdata");
    var tr;
    
    while (tdata.firstChild) {
        tdata.removeChild(tdata.firstChild);
    }
    //render localstorage data
    function appendValue(value) {
        var td1 = document.createElement('td');
        td1.innerHTML = value;
        tr.appendChild(td1);
    }

    function appendButtons(button1, button2, button3) {
        var td1 = document.createElement('td');
        var div = document.createElement('div');
        div.appendChild(button1);
        div.appendChild(button2);
        div.appendChild(button3);
        td1.appendChild(div);
        tr.appendChild(td1);
    }

    for (var i = 0; i < contacts.length; i++) {
        contact = contacts[i];
        tr = document.createElement('tr');
        appendValue(contact.phone);
        appendValue(contact.name);
        appendValue(contact.place);
        appendValue(contact.gender);

        var viewButton = document.createElement("button");
        viewButton.setAttribute("onclick", "viewContact(" + i + ");");
        viewButton.setAttribute("class", "btn btn-info btn-table");
        viewButton.setAttribute("data-target", "#viewContactModal");
        viewButton.setAttribute("data-toggle", "modal");
        viewButton.innerHTML = "View";

        var editButton = document.createElement("button");
        editButton.setAttribute("onclick", "openEditForm(" + i + ");");
        editButton.setAttribute("class", "btn btn-success btn-table");
        editButton.setAttribute("data-toggle", "modal");
        editButton.setAttribute("data-target", "#editContactModal");
        editButton.innerHTML = "Edit";

        var deleteButton = document.createElement("button");
        deleteButton.setAttribute("onclick", "deleteContact(" + i + ");");
        deleteButton.setAttribute("class", "btn btn-danger btn-table");
        deleteButton.innerHTML = "Delete";

        appendButtons(viewButton, editButton, deleteButton);

        document.getElementById("tdata").appendChild(tr);

    }

}

function renderGridLocal() {
    var contacts = getContactsFromLocal();
    renderGridFiltered(contacts);
    resetFilterValues();
}

//get existing contacts from localStorage
function getContactsFromLocal() {
    var restoredContacts = JSON.parse(localStorage.getItem('contacts'));
    //restoredContacts.push(contact);
    return restoredContacts;
}
//set contacts to localStorage
function setContactsToLocal(contacts) {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

//import from text file
function importContacts() {    
    inputToJson(document.getElementById("importContacts").value);
    
    //reset importForm
    document.getElementById("importContacts").value = "";
}
//transform input to JSON with internal values for sex, sign
function inputToJson(inputText) {
    var contactLines = inputText.split('\n');
    var gender = {};
    gender["м"] = "Male";
    gender["ж"] = "Female";

    var signs = {};

    signs["Овен"] = "Aries";
    signs["Телец"] = "Taurus";
    signs["Близнаци"] = "Gemini";
    signs["Рак"] = "Cancer";
    signs["Лъв"] = "Leo";
    signs["Дева"] = "Virgo";
    signs["Везни"] = "Libra";
    signs["Скорпион"] = "Scorpio";
    signs["Стрелец"] = "Sagitarrius";
    signs["Козирог"] = "Capricorn";
    signs["Водолей"] = "Aquarius";
    signs["Риби"] = "Pisces";

    var importResult = document.getElementById("importResult");
    
    for (var i = 0; i < contactLines.length; i++) {
        var li = document.createElement('li');
        var div1 = document.createElement('div');
        div1.setAttribute("class", "importedString");
        var div2 = document.createElement('div');
        div2.setAttribute("class", "importedResult");
        var contactData = contactLines[i].split('\t');
        var contact = createContact(contactData[0], contactData[1], contactData[2], gender[contactData[3]], signs[contactData[4]], contactData[5]);
        div1.innerHTML = contactData.toString();
        div2.innerHTML = addContactToLocal(contact);
        li.appendChild(div1);
        li.appendChild(div2);
        importResult.appendChild(li);
    }
    renderGridLocal();
}

function resetResult(){
   document.getElementById("importResult").innerHTML = "";
}
//add new contact from add form
function addNewContact() {
    //radiobutton value, toDo: use jQuery
    var genders = document.getElementsByName('gender');
    var gender;
    if (genders[0].checked)
        gender = genders[0].value;
    else
        gender = genders[1].value;
    var contact = createContact(document.getElementById("phone").value, transformSymbols(document.getElementById("name").value), transformSymbols(document.getElementById("place").value), gender, document.getElementById("sign").value, transformSymbols(document.getElementById("notes").value));
    console.log(contact);
    showAlertInForm(addContactToLocal(contact), "alertMessageAdd");

    renderGridLocal();
}
//show alert of validation and results in form
function showAlertInForm(message, id) {
    //reset alertMessage in form
    console.log(message, id);
    document.getElementById(id).innerHTML = "";

    document.getElementById(id).innerHTML = message;
}

//try to add contact to local. If contact is not valid or already exists, return alert messages
function addContactToLocal(contact) {
    var alertMessage = "";
    var validationResult = isContactValid(contact);
    if (!validationResult.valid) {
        alertMessage = "Contact is not valid \r\n" + validationResult.badValue;
    } else
    if (doesContactExistLocal(contact))

        alertMessage = "Contact already exists";
    else {
        console.log("Contact is new");
        var restoredContacts = getContactsFromLocal();
        restoredContacts.push(contact);
        setContactsToLocal(restoredContacts);
        console.log(restoredContacts);
        alertMessage = "Contact was created successfully";
    }
    return alertMessage;
}

//function is called in createNewContact with 1 arg (newContact)
//function is called in editContact with 2 arg (contact, indexOfContact)
function doesContactExistLocal(newContact, index) {
    var contacts = getContactsFromLocal();
    //delete element, that is edited, from the array to compare it with other elements in array
    if (index !== undefined)
        contacts.splice(index, 1);
    for (var i = 0; i < contacts.length; i++)
        if (contacts[i].phone == newContact.phone || contacts[i].name == newContact.name)
            return true;
    return false;
}

function isContactValid(contact) {
    var regexPhone = /^[+0][0-9]+$/;
    var badValue = "";
    var valid = true;
    var result = {};
    console.log("Check phone ", contact.phone, contact.phone.match(regexPhone));
    if (!contact.phone || contact.phone.match(regexPhone) == null || contact.phone.length > 12 || contact.phone.length < 6) {

        console.log("Empty or Not valid phone", contact.phone);
        badValue += "Empty or Not valid phone. Min length is 6, max length is 12, start with + or 0 \r\n";
        valid = false;
    }
    if (!contact.name || contact.name.length > 30) {
        console.log("Empty or Not valid name", contact.name);
        badValue += "Empty or Not valid name. Max length is 30 \r\n";
        valid = false;
    }
    //toDo place autocomplete?

    if (contact.notes !== undefined && contact.notes !== null && contact.notes.length > 500) {
        console.log("Long notes", contact.notes);
        badValue += "Not valid notes. Max length is 500 \r\n";
        valid = false;
    }
    result["valid"] = valid;
    result["badValue"] = badValue;
    return result;
}
//init form when edit a contact
function openEditForm(index) {
    //reset alert message
    document.getElementById("alertMessageEdit").innerHTML = "";
    //init autocomlete place
    $(function() {
        var places = getPlacesFromLocal()
        console.log(places);
        $("#editPlace").autocomplete({
            source: places
        });
    });

    var contacts = getContactsFromLocal();
    document.getElementById("editButton").setAttribute("onclick", "saveEditedContact(" + index + ")");
    console.log(contacts[index].gender, contacts[index])
    document.getElementById("editPhone").value = contacts[index].phone;
    document.getElementById("editName").value = contacts[index].name;
    document.getElementById("editPlace").value = contacts[index].place;

    if (contacts[index].gender == "Male")
        document.getElementById("Male").checked = true;
    else if (contacts[index].gender == "Female")
        document.getElementById("Female").checked = true;

    document.getElementById("editSign").value = contacts[index].sign;
    document.getElementById("editNotes").value = contacts[index].notes;
}
//try to save edited contact. If contact is not valid or already exists, return alert messages 
function saveEditedContact(index) {
    var contacts = getContactsFromLocal();
    var genders = document.getElementsByName('editGender');
    var gender;
    if (genders[0].checked)
        gender = genders[0].value;
    else
        gender = genders[1].value;

    var contact = {};
    contact.phone = document.getElementById("editPhone").value;
    contact.name = document.getElementById("editName").value;
    contact.place = document.getElementById("editPlace").value;
    contact.gender = gender;
    contact.sign = document.getElementById("editSign").value;
    contact.notes = document.getElementById("editNotes").value;
    if (!isContactValid(contact).valid) {
        showAlertInForm("Contact is not valid \r\n" + isContactValid(contact).badValue, "alertMessageEdit");
        console.log("contact is not valid");
    } else if (doesContactExistLocal(contact, index)) {
        showAlertInForm("Contact already exists", "alertMessageEdit")
        console.log(contact, index);
    } else {
        contacts[index] = contact;
        showAlertInForm("Contact was changed successfully", "alertMessageEdit");
        contacts[index] = contact;
        setContactsToLocal(contacts);
        renderGridLocal();
    }


}

//init view form with contact data, index is the number of contact in localStorage
function viewContact(index) {
    var contacts = getContactsFromLocal();
    console.log(contacts[index]);
    fillField("viewPhone", contacts[index].phone);
    fillField("viewName", contacts[index].name);
    fillField("viewPlace", contacts[index].place);
    fillField("viewGender", contacts[index].gender);
    fillField("viewSign", contacts[index].sign);
    fillField("viewNotes", contacts[index].notes);
}

function fillField(fieldName, value) {
    if (value !== "" && value !== null && value !== undefined)
        document.getElementById(fieldName).value = value;
    else
        document.getElementById(fieldName).value = "";

}
//delete contact from local storage, index is the number of contact in localStorage
function deleteContact(index) {
    var contacts = getContactsFromLocal();
    console.log(contacts);
    console.log("Delete index ", index);
    contacts.splice(index, 1);
    console.log(contacts);
    setContactsToLocal(contacts);
    //show contacts according to rendered
    renderGridFiltered(filterContacts());
}


function sortContactsBy(fieldName, ascending, buttonId) {
    //Take filtered contacts
    var contacts = filterContacts();
    //Sort filtered contacts
    contacts.sort(function(a, b) {
        if (a[fieldName] > b[fieldName]) {
            return ascending ? +1 : -1;
        }
        if (a[fieldName] < b[fieldName]) {
            return ascending ? -1 : +1;
        }
        return 0;
    });

    renderGridFiltered(contacts);
}

function filterContacts() {
    var filterNames = ["phone", "name", "place", "gender"];
    var contacts = getContactsFromLocal();

    for (var i = 0; i < filterNames.length; ++i) {
        var filterName = filterNames[i];
        query = document.getElementById(filterName + "Filter").value;
        console.log(query);
        if (query != "")
            contacts = contacts.filter(makeFilterBy(filterName, query));
    }

    renderGridFiltered(contacts);
    console.log(contacts);
    return contacts;

    function makeFilterBy(fieldName, filterVal) {
        return function(contact) {
            //Filter is not case sensitive
            return contact[fieldName].toLowerCase().indexOf(filterVal.toLowerCase()) >= 0;
        }
    }
}

function createContact(phone, name, place, gender, sign, notes) {
    var contact = {};
    contact.phone = phone;
    contact.name = name;
    contact.place = place;
    contact.gender = gender;
    contact.sign = sign;
    contact.notes = notes;
    return contact;
}
//replace symbols, which can corrupt html when create new contact
function transformSymbols(inputString) {
    inputString = inputString.replace(/</g, "&lt;");
    inputString = inputString.replace(/>/g, "&gt;");
    return inputString;
}

function resetFilterValues() {
    document.getElementById("phoneFilter").value = "";
    document.getElementById("nameFilter").value = "";
    document.getElementById("placeFilter").value = "";
    document.getElementById("genderFilter").value = "";
}

function resetAddContactForm() {
    document.getElementById("phone").value = "";
    document.getElementById("name").value = "";
    document.getElementById("place").value = "";
    document.getElementById("genderMale").checked = true;
    document.getElementById("sign").value = "notSelected";
    document.getElementById("notes").value = "";
    document.getElementById("alertMessageAdd").innerHTML = "";

    $(function() {
        var places = getPlacesFromLocal()
        console.log(places);
        $("#place").autocomplete({
            source: places
        });
    });
}

function getPlacesFromLocal() {
    var contacts = getContactsFromLocal();
    var places = [];
    for (var i = 0; i < contacts.length; i++) {
        console.log("Places ", contacts[i], contacts[i].place);
        //don't add empty values and duplicates
        console.log("Exist?? ", contacts[i].place, places.lastIndexOf(contacts[i].place));
        if (contacts[i].place != "" && places.lastIndexOf(contacts[i].place) == -1) {
            places.push(contacts[i].place);
        }
    }
    return places;
}

function testValidContacts() {
    console.log(isContactValid(contacts[0]));
    console.log(isContactValid(contacts[1]));
    console.log(isContactValid(contacts[2]));
}