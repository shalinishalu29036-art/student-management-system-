// ==========================================
// STUDENT MANAGEMENT SYSTEM
// Frontend JavaScript
// ==========================================

// Backend REST API URL
const API_URL = "http://localhost:5000/api/students";


// ==========================================
// Get HTML Elements
// ==========================================

const studentForm = document.getElementById("studentForm");

const studentId = document.getElementById("studentId");
const nameInput = document.getElementById("name");
const rollNumberInput = document.getElementById("rollNumber");
const departmentInput = document.getElementById("department");
const yearInput = document.getElementById("year");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");

const tableBody = document.getElementById("studentTableBody");

const searchInput = document.getElementById("search");

const errorMessage = document.getElementById("errorMessage");

const formTitle = document.getElementById("formTitle");

const cancelButton = document.getElementById("cancelButton");


// Store students
let students = [];


// ==========================================
// READ - Load Students
// ==========================================

async function loadStudents() {

    try {

        const response = await fetch(API_URL);

        const result = await response.json();

        if (result.success) {

            students = result.data;

            displayStudents(students);

        } else {

            showError("Unable to load students.");

        }

    } catch (error) {

        console.error(error);

        showError(
            "Cannot connect to backend. Please start the server."
        );

    }
}


// ==========================================
// Display Students
// ==========================================

function displayStudents(studentList) {

    tableBody.innerHTML = "";

    if (studentList.length === 0) {

        document.getElementById("emptyMessage")
            .classList.remove("hidden");

        return;
    }

    document.getElementById("emptyMessage")
        .classList.add("hidden");


    studentList.forEach(function(student) {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${student.id}</td>

            <td>${escapeHTML(student.name)}</td>

            <td>${escapeHTML(student.rollNumber)}</td>

            <td>${escapeHTML(student.department)}</td>

            <td>${student.year}</td>

            <td>${escapeHTML(student.email)}</td>

            <td>${escapeHTML(student.phone || "-")}</td>

            <td>

                <button
                    class="edit-btn"
                    onclick="editStudent(${student.id})"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteStudent(${student.id})"
                >
                    Delete
                </button>

            </td>
        `;

        tableBody.appendChild(row);

    });

}


// ==========================================
// CREATE / UPDATE
// ==========================================

studentForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    clearError();


    // Get form values
    const name = nameInput.value.trim();

    const rollNumber = rollNumberInput.value.trim();

    const department = departmentInput.value;

    const year = yearInput.value;

    const email = emailInput.value.trim();

    const phone = phoneInput.value.trim();


    // ======================================
    // Client-side Validation
    // ======================================

    if (name.length < 2) {

        showError("Student name must contain at least 2 characters.");

        return;
    }


    if (rollNumber === "") {

        showError("Roll number is required.");

        return;
    }


    if (department === "") {

        showError("Please select a department.");

        return;
    }


    if (year === "") {

        showError("Please select the year.");

        return;
    }


    // Email validation
    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {

        showError("Please enter a valid email address.");

        return;
    }


    // Phone validation
    if (
        phone !== "" &&
        !/^[0-9]{10}$/.test(phone)
    ) {

        showError("Phone number must contain 10 digits.");

        return;
    }


    // Data sent to backend
    const studentData = {

        name: name,

        rollNumber: rollNumber,

        department: department,

        year: Number(year),

        email: email,

        phone: phone

    };


    try {

        let response;


        // ==================================
        // UPDATE
        // ==================================

        if (studentId.value) {

            response = await fetch(
                `${API_URL}/${studentId.value}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(studentData)
                }
            );

        }


        // ==================================
        // CREATE
        // ==================================

        else {

            response = await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(studentData)
                }
            );

        }


        const result = await response.json();


        if (!result.success) {

            showError(
                result.errors
                    ? result.errors.join(", ")
                    : result.message
            );

            return;
        }


        // Success
        alert(
            studentId.value
                ? "Student updated successfully!"
                : "Student added successfully!"
        );


        resetForm();

        loadStudents();


    } catch (error) {

        console.error(error);

        showError(
            "Server error. Please try again."
        );

    }

});


// ==========================================
// UPDATE - Edit Student
// ==========================================

function editStudent(id) {

    const student = students.find(
        function(item) {
            return item.id == id;
        }
    );


    if (!student) {

        alert("Student not found.");

        return;
    }


    studentId.value = student.id;

    nameInput.value = student.name;

    rollNumberInput.value = student.rollNumber;

    departmentInput.value = student.department;

    yearInput.value = student.year;

    emailInput.value = student.email;

    phoneInput.value = student.phone || "";


    formTitle.textContent = "Edit Student";

    cancelButton.classList.remove("hidden");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ==========================================
// DELETE - Delete Student
// ==========================================

async function deleteStudent(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this student?"
    );


    if (!confirmDelete) {

        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );


        const result = await response.json();


        if (!result.success) {

            alert(
                result.message || "Delete failed."
            );

            return;
        }


        alert(
            "Student deleted successfully!"
        );


        loadStudents();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to backend."
        );

    }

}


// ==========================================
// SEARCH
// ==========================================

searchInput.addEventListener(
    "input",
    function() {

        const searchText =
            searchInput.value
                .toLowerCase()
                .trim();


        const filteredStudents =
            students.filter(function(student) {

                return (

                    student.name
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    student.rollNumber
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    student.department
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    student.email
                        .toLowerCase()
                        .includes(searchText)

                );

            });


        displayStudents(filteredStudents);

    }
);


// ==========================================
// Cancel Edit
// ==========================================

cancelButton.addEventListener(
    "click",
    function() {

        resetForm();

    }
);


// ==========================================
// Reset Form
// ==========================================

function resetForm() {

    studentForm.reset();

    studentId.value = "";

    formTitle.textContent = "Add Student";

    cancelButton.classList.add("hidden");

    clearError();

}


// ==========================================
// Error Message
// ==========================================

function showError(message) {

    errorMessage.textContent = message;

}


function clearError() {

    errorMessage.textContent = "";

}


// ==========================================
// Security - Escape HTML
// ==========================================

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;

}


// ==========================================
// Start Application
// ==========================================

loadStudents();
