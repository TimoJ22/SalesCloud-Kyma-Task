const axios = require('axios');

module.exports = {
  main: async function (event, context) {
       var message = "";
     
     // GET Event Payload
      let eventPayload = event.extensions.request.body;

      // SPLIT Event Data in Current and Before
      let eventDataBefore = eventPayload.data.beforeImage;
      let eventDataCurrent = eventPayload.data.currentImage;

     // GET Current Priority and parse to Integer
      let currentPriority = parseInt(eventDataCurrent.priority);
      let beforePriority = parseInt(eventDataBefore.priority);

     // CHECK Priority - 1 & 2 Urgent / Immediate
      if(currentPriority < 3 && beforePriority > 2) {
           message = console.log("Service Request: " + eventDataCurrent.displayId + " - Priority was raised, Additional Task will be created.");
           createTask(eventDataCurrent);
      } else {
           message = console.log("Service Request: " + eventDataCurrent.displayId + " - No Task was created, Priority is too low.");
      }

    return message;
  }
}

async function createTask(eventDataCurrent) {

     // SET System Parameter
    let scv2 = ""; // <System URL>
    let path = '/sap/c4c/api/v1/task-service/tasks';
    let auth = ""; // Basic Auth Header

     // SET Default Values
    let taskCategory = '0002'; // Define Special Task Category for this case
    let status = "OPEN"; // Define Task Status
    let priority = "URGENT"; // Define Task Priority
    let startDate = new Date(); // Current Timestamp
    let dueDate = new Date(); // Add One Day to the current Timestamp
    dueDate.setDate(dueDate.getDate() + 1);

     // BUILD Request Data
     // Organizer of the Task is the current interface user
    let reqData = JSON.stringify({
         "description": "Follow Up Case: " + eventDataCurrent.displayId,
         "owner": {
              "id": eventDataCurrent.processor.id
              },
          "startDateTime": startDate,
          "dueDateTime": dueDate,
          "priority": priority,
          "status": status,
          "taskCategory": taskCategory,  
          "notes": [
               {
                     "content": "Service Request: " + eventDataCurrent.displayId + " - Priority was raised. Please solve this case immediately."
                     }
                     ]
               });
    
    // BUILD Request with Error Handling
    let req
    req = {
         method: 'POST',
         maxBodyLength: Infinity,
         url: `${scv2}${path}`,
         headers: { 
                    'Authorization': auth,
                    'Content-Type': 'application/json'
                },        
        data : reqData
    };

    axios.request(req)
    .then((response) => {
//         GET ID of the task we created
         console.log("Service Request: " + eventDataCurrent.displayId + " - Additional Task was created: " + response.data.value.displayId)
    })
    .catch((error) => {
        console.log(error);
    });

}