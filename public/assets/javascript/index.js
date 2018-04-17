var userResultGlobalObject = {}
    // Hide the main page content initially
    $('.ui.grid.container').hide()

    // Hide Done button
    $('#done-button').hide()

// ************* Initializations *************************
document.addEventListener('DOMContentLoaded', function() {
    console.log("Index.js loaded")


    const app = firebase.app()
    const db = firebase.firestore()

    // Initialize add task button pop window
    $('#add-task')
    .popup({
      popup : $('.custom.popup'),
      on    : 'click'
    })

    // Initialize modal
    $('.ui.fullscreen.modal')
    .modal('attach events', '#calendar-button', 'show')

    displayDayToday()
    // Clear form (doesnt work)
    // $('.ui.form').form();

    // $('form#add-input').each(function() {
    //     $(this).form('reset');
    // })

    // Form validation
    // $('.ui.form')
    // .form({
    //     fields: {
    //     name     : 'empty',
    //     gender   : 'empty',
    //     username : 'empty',
    //     password : ['minLength[6]', 'empty'],
    //     skills   : ['minCount[2]', 'empty'],
    //     terms    : 'checked'
    //     }
    // })

    // Initialize dropdowns
    $('.ui.selection.dropdown').dropdown()

    // Check if user logged in. If logged in go to next page
    firebase.auth().onAuthStateChanged(newLoginHappened)

  })


function login() {
// Get current user. IF user is signed in execute app(). Else, signinwithpop
firebase.auth().onAuthStateChanged(newLoginHappened)
} // END googleLogin

// Executes app
function newLoginHappened (result) {
if (result) {
    console.log("user is signed in")
    console.log(result)
    
    $('#login-page').hide()
    // Proceed to main and pass the result
    app(result)
} else {
    // Choose Google as Auth provider
    const provider = new firebase.auth.GoogleAuthProvider()
    // ELSE Open signInWithPop when NOT signed it
    firebase.auth().signInWithPopup(provider)
    .then(result => {
        console.log(result)
    // Hide login page after logging in
    $('#login-page').hide()
    // Proceed to main logic
        app(result)
    })
    }
    userResultGlobalObject = result
}

  //*********** MAIN LOGIC GOES INSIDE THIS FUNCTION****************************************
  function app(userLogin) {
    const name = userLogin.displayName
    const email = userLogin.email
    
    console.log(name)
    console.log(email)
    console.log()
    // Hide signin-button
    // $('#signin-button').hide()

    // Change signin to user name
    $('#signin-container').html(`<div class="item">Hello, ${name}</div>`)
    
    // Show main page content after login
    $('.ui.grid.container').show(1000)
    

    // Check if user already in the database. Add user when not found.
    userChecker(userLogin)


    // 2. Call this function that GETs data from DB, then render in UI
    renderTodoUI(userLogin)
    
    
    

    // document.write(`<button class="g-signout"id="signOut" onclick="signOut()">Sign Out</button>`)
  }


  //******** FUNCTIONS *****************************************************************
  //
  // --- Section 1: Logic functions ---
function addToUI() {
    event.preventDefault()
    
    console.log('\n-Button clicked- Added a Goal\n')
    // Get the task "value" from the textbox and store it
    const goal = $('#add-input').val().trim()
    const dueDate = $('#due-date-input').val()
    const category = $('#category-input').dropdown("get value")
    const priority = $('#priority-input').dropdown("get value")

    const inputsArray = [goal, dueDate, category, priority]
    var isGoalOrTask = ''

    console.log('Goal:', goal)
    console.log('dueDate: ', dueDate)
    console.log('category:', category)
    console.log('priority:', priority[1])
    console.log('')

    if(category === 'goal') {
        isGoalOrTask = '#goals-main-list'
    }

    if(category === 'task') {
        isGoalOrTask = '#tasks-main-list'
    }

    // const eventDate = $('#test-04202018')
    const UIListItem = $(`<div class="item extra text">`)
    const UICheckbox = $(`<div class="ui checkbox">`)
    const UITaskInput = $(`<input type="checkbox">`)
    const UITaskLabel = $(`<label>`)
    
    // ********* THIS IS AN IMPORTANT VARIABLE ****
    const goalList = $(isGoalOrTask)

    const goalListItem = $(UIListItem).appendTo(goalList)
    const goalListCheckbox = $(UICheckbox).appendTo(goalListItem)
    const goalListInput = $(UITaskInput).appendTo(goalListCheckbox)
    const goalListLabel = $(UITaskLabel).appendTo(goalListCheckbox)

    // Hacky validation. Ask for help to validate fields with Semantic UI
    if(goal || dueDate || category || priority) {
        inputsArray.forEach(element => {
            if(!element) {
                return
            }

            else {
                console.log("\nAppended element: ", element)
                goalListLabel.append(element)
            }
        })
    }
    $('#add-input').text('')
  }


// This function is called to add Todo to DB, 
// - then, use GET to render in UI
function addTodo() {
    event.preventDefault()
    console.log('\nAdd goal or task...')
    const category = $('#category-input').dropdown("get value")
    const dueDate = $('#due-date-input').val()

    console.log('Input category is: ', category)
    // 1. Add to DB
    addTodoDB()

    // 2. Add to UI
    addToUI()
}

//This function adds Todo to database in goalsCollection or tasksCollection
function addTodoDB(){
    event.preventDefault()
    console.log("\nAdd Todo DB function fired off..\n")
        
    const db = firebase.firestore()
    const usersCollection = db.collection('users')
    const todo = $('#add-input').val().trim()
    const priority = $('#priority-input').val().trim()
    const email = userResultGlobalObject.email
    // const timeNow = currentTimestamp()
    const timeNow = Date.now()
    const category = $('#category-input').dropdown("get value")
    const dueDate = $('#due-date-input').val()
    const timestamp = firebase.firestore.FieldValue.serverTimestamp()

    var userRecordDoc = ''

    var findUser = usersCollection.where('email', '==', email).get()
    .then(function (querySnapshot) {
        console.log('User query using email: ', querySnapshot)

        querySnapshot.forEach(function (doc){
            userRecordDoc = doc.id 
            // Log data
            console.log('Document data: ', doc.data() )
            // Log generated document ID
            console.log('Document ID: ', userRecordDoc )


            if(category === 'goal') {
                // Create collection and goal doc. Add data
                var goalsCollection = usersCollection.doc(userRecordDoc).collection('goalsCollection')
                console.log('goalsCollection Path: ', goalsCollection)
                // Find highest entry number by sorting 
                // var lastEntry = db.ref(goalsCollection).orderByValue().limitToLast(1)
                // entryNumber: 5, WORK IN PROGRESS
                // console.log('Number of Goal entries: ',lastEntry)
                // Add new document to goals collection

                goalsCollection.add({
                    category: 'goal',
                    completedBool: 'false',
                    due: dueDate,
                    entryMessage: todo,
                    entryTimestamp: timeNow,
                    priority: priority
                })
            }

            if(category === 'task') {
                // Create collection and goal doc. Add data
                var tasksCollection = usersCollection.doc(userRecordDoc).collection('tasksCollection')
                console.log('tasksCollection Path: ', tasksCollection)
                // Find highest entry number by sorting 
                // var lastEntry = db.ref(goalsList).orderByValue().limitToLast(1)
                // entryNumber: 5, WORK IN PROGRESS
                // console.log('Number of Goal entries: ',lastEntry)
                // Add new document to goals collection

                tasksCollection.add({
                    category: 'task',
                    completedBool: 'false',
                    due: dueDate,
                    entryMessage: todo,
                    entryTimestamp: timeNow,
                    priority: priority
                })
            }

        })

    })

}

// This function loads all relevant data. Ideally used for initial rendering of page when loaded
function renderTodoUI(user) {
    
    console.log('\n-function renderTodoUI fired off...\n')
    
    // ******************* PSEUDO CODE *******************
    // Logic Step1: Define today's date and set it as default query
    // Logic Step2: Find all tasks that have today's date
    // Logic Step 2A: Find all tasks that have SELECTED date
    // Logic Step 3: Get data using where to find today's date
    // ***************************************************


    // Step 1: Set db variables and today's date (default)
    const db = firebase.firestore()
    const usersCollection = db.collection('users')
    const email = user.email
    var startOfDay = moment('00:00', "HH:mm")
    var endOfDay = moment('23:59', "HH:mm")
    var inputGoalsOrTask = ''
    var userDocPathScopeout = ''
    var userGoalsOrTasksCollectionScopeout = ''
    
    console.log('email has value:', email)
    usersCollection.where('email', '==', email).get()
    .then(function (querySnapshot) {
        console.log('QUERY SNAP: ', querySnapshot)
        querySnapshot.forEach(function (doc){
            userRecordDoc = doc.id 
            // Log data
            console.log('Document data: ', doc.data() )
            // Log generated document ID
            console.log('Document ID: ', userRecordDoc )
            const userDocPath = db.doc('users/' + userRecordDoc)
            userDocPathScopeout = userDocPath
            
            // Step 1: query the tasks collection
            const queryTasksCollection = userDocPath.collection('tasksCollection')
            queryTasksCollection.where('entryTimestamp', '>=', startOfDay.valueOf()).where('entryTimestamp', '<=', endOfDay.valueOf()).get()
            .then(function (querySnapshot){
                querySnapshot.forEach(function(doc){
                const todoData = doc.data()
                console.log('\n ******* doc.data():', doc.data())
                // Get the task "value" from the textbox and store it
                var goal = todoData.entryMessage
                const dueDate = $('#due-date-input').val()
                // const category = todoData.category
                const category = ''
                const priority = $('#priority-input').dropdown("get value")
                const inputsArray = [goal, dueDate, category, priority]
                var isGoalOrTask = ''

                console.log('Goal:', goal)
                console.log('dueDate: ', dueDate)
                console.log('category:', category)
                console.log('priority:', priority[1])
                console.log('')
        
                const UIListItem = $(`<div class="item extra text">`)
                const UICheckbox = $(`<div class="ui checkbox">`)
                const UITaskInput = $(`<input type="checkbox">`)
                const UITaskLabel = $(`<label>`)
                
                const goalList = $('#tasks-main-list')
                const goalListItem = $(UIListItem).appendTo(goalList)
                const goalListCheckbox = $(UICheckbox).appendTo(goalListItem)
                const goalListInput = $(UITaskInput).appendTo(goalListCheckbox)
                const goalListLabel = $(UITaskLabel).appendTo(goalListCheckbox)
        
            // Hacky validation. Ask for help to validate fields with Semantic UI
            if(goal || dueDate || category || priority) {
                inputsArray.forEach(element => {
                    if(!element) {
                        return
                    }
    
                    else {
                        console.log("\nAppended element: ", element)
                        goalListLabel.append(element)
                    }
                })
            }
            $('#add-input').text('')
                              
        })
    })

            // Step 2: query the goals collection
            const queryGoalsCollection = userDocPath.collection('goalsCollection')
            queryGoalsCollection.where('entryTimestamp', '>=', startOfDay.valueOf()).where('entryTimestamp', '<=', endOfDay.valueOf()).get()
            .then(function (querySnapshot){
                querySnapshot.forEach(function(doc){
                const todoData = doc.data()
                console.log('\n ******* doc.data():', doc.data())
                // Get the task "value" from the textbox and store it
                var goal = todoData.entryMessage
                const dueDate = $('#due-date-input').val()
                // const category = todoData.category
                const category = ''
                const priority = $('#priority-input').dropdown("get value")
                const inputsArray = [goal, dueDate, category, priority]
                var isGoalOrTask = ''

                console.log('Goal:', goal)
                console.log('dueDate: ', dueDate)
                console.log('category:', category)
                console.log('priority:', priority[1])
                console.log('')


                const UIListItem = $(`<div class="item extra text">`)
                const UICheckbox = $(`<div class="ui checkbox">`)
                const UITaskInput = $(`<input type="checkbox">`)
                const UITaskLabel = $(`<label>`)
      
                const goalList = $('#goals-main-list')
                const goalListItem = $(UIListItem).appendTo(goalList)
                const goalListCheckbox = $(UICheckbox).appendTo(goalListItem)
                const goalListInput = $(UITaskInput).appendTo(goalListCheckbox)
                const goalListLabel = $(UITaskLabel).appendTo(goalListCheckbox)

                // Hacky validation. Ask for help to validate fields with Semantic UI
                if(goal || dueDate || category || priority) {
                    inputsArray.forEach(element => {
                        if(!element) {
                            return
                        }

                        else {
                            console.log("\nAppended element: ", element)
                            goalListLabel.append(element)
                        }
                    })
                }
                $('#add-input').text('')
            })
        })
    })
})
} //END FUNCTION


function validateThreeThings() {
    var doWell = $('#do-well').val()
    var gratefulFor = $('#grateful-for').val()
    var doneBetter = $('#done-better').val()
    console.log('doWell: ', doWell)
    console.log('gratefulFor: ', gratefulFor)
    console.log('doneBetter: ', doneBetter)

    if(doWell && gratefulFor && doneBetter) {
        // Show Done button 
        $('#done-button').show()
    }
}

function addThreeThingsToDB(){
    event.preventDefault()
    console.log("\naddThreeThingsToDB fired off..\n")
        
    const db = firebase.firestore()
    const usersCollection = db.collection('users')
    const todo = $('#add-input').val().trim()
    const priority = $('#priority-input').val().trim()
    const email = userResultGlobalObject.email
    const timeNow = Date.now()
    const category = $('#category-input').dropdown("get value")
    const dueDate = $('#due-date-input').val()
    var userRecordDoc = ''

    var findUser = usersCollection.where('email', '==', email).get()
    .then(function (querySnapshot) {
        console.log('User query using email: ', querySnapshot)

        querySnapshot.forEach(function (doc){
            userRecordDoc = doc.id 
            // Log data
            console.log('Document data: ', doc.data() )
            // Log generated document ID
            console.log('Document ID: ', userRecordDoc )

                // Create collection and goal doc. Add data
                var threeThingsCollection = usersCollection.doc(userRecordDoc).collection('threeThingsCollection')
                console.log('threeThingsCollection Path: ', threeThingsCollection)
                // Find highest entry number by sorting 
                // var lastEntry = db.ref(goalsCollection).orderByValue().limitToLast(1)
                // entryNumber: 5, WORK IN PROGRESS
                // console.log('Number of Goal entries: ',lastEntry)
                // Add new document to goals collection

                threeThingsCollection.add({
                    completedBool: 'false',
                    entryTimestamp: timeNow,
                    doWell: $('#do-well').val(),
                    doneBetter: $('#done-better').val(),
                    gratefulFor: $('#grateful-for').val()
                })

        })

    })

}


  // --- Section 2: Database functions ---

function userChecker(user) {
    const db = firebase.firestore()
    const usersCollection = db.collection('users')

    var findUser = ''
    // Check to see if user exists
    findUser = usersCollection.where('email', '==', user.email).get()
    .then(function (querySnapshot) {
    console.log('this ran')
    // console.log(querySnapshot.QuerySnapshot.doc)
    let userChecker = false
    querySnapshot.forEach(function (doc) {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        console.log("doc: ", doc)
        // IF user is found, exit out of function. No need to proceed
        if (doc) {
        userChecker = true
        console.log("This user exists already.")

        return
        }
    });
    if(!userChecker) addUser(user)
    })
    .catch(function (error) {
    console.log("Error getting documents: ", error);
    })
}

// Add uniqueID doc containing user information
function addUser(userInfo){
    const db = firebase.firestore()
    const usersCollection = db.collection('users')
    usersCollection.add({
        email: userInfo.email,
        name: userInfo.displayName,
        
    })
    .then(function(docRef){
        console.log("Document written with ID: ", docRef.id)

    })
    .catch(function(error){
        console.error("Error adding document: ", error)
    })
}



// --- Section 3: Misc Functions
function currentTimestamp() {
    event.preventDefault()
    
    var currentTime = moment()
    timeFormat = 'MM/DD/YYYY hh:mm:ss a'

    console.log("CURRENT TIME inside function: " + moment(currentTime).format(timeFormat))
    $('#current-time').text(moment(currentTime).format(timeFormat))

    return currentTime.format(timeFormat)
};

function displayDayToday() {
    const day = moment().format('dddd')
    const date = moment().format('MM/DD/YYYY')
    console.log('Today is: ', day)
    
    $('#display-day').text(day)
    $('#display-date').text(date)

}


