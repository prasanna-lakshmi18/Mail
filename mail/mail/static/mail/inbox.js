document.addEventListener('DOMContentLoaded', function() {
  const count=0;

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = () => {
    //event.preventDefault();
  
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        load_mailbox('sent');
        alert("Mail sent successfully!");
    });
    return false;
  }
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function view_email(id){
  console.log(id);
  
}

function load_mailbox(mailbox) {
  var email_variable=mailbox;
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h2 style="color:white;">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h2>`;

  const element = document.createElement('div');
  element.style.margin="100px"
  
  fetch(`/emails/${email_variable}`)
    .then(response => response.json())
    .then(emails => {
    // Print emails
      emails.forEach(email => {
        console.log(email);
        var open_email=email;
        const element = document.createElement('div');
        element.style.boxShadow = "0 4px 8px black";
        
        //Archieve
        const archieve_button=document.createElement('button');
        if (email.archived === true){
          archieve_button.innerHTML="Unarchieve";
        }
        else{
          archieve_button.innerHTML="Archieve";
        }
        archieve_button.addEventListener('click', function() {
          if (email.archived === true){
            fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: false
              })
            })          
            archieve_button.innerHTML="Archieve";
            
          }
          else{
            fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: true
              })
            })
            archieve_button.innerHTML="Unarchieve";
            
          }
          load_mailbox('inbox');
        });
        if(mailbox === 'inbox' || mailbox === 'archive'){
          document.querySelector('#emails-view').append(archieve_button);
        }
        

        //to view email,update, read variable
        element.addEventListener('click', function() {
          const ele=`${email.id}`
          console.log(ele);
          
          fetch(`/emails/${ele}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          })
    
          document.querySelector('#emails-view').append(element); 
          if (mailbox === 'inbox' || mailbox === 'archieve'){
            user = email.sender;
          }
          else{
            user = email.recipients;
          }
          document.querySelector('#emails-view').style.color="black";
          document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3><ul class="list-group">
          <li class="list-group-item"><strong>From:</strong> ${user}</li>
          <li class="list-group-item"><strong >Subject:</strong> ${email.subject}</li>
          <li class="list-group-item">${email.timestamp}</li>
          <li class="list-group-item">${email.body}</li></ul>
          `;
          if(mailbox === 'inbox' || mailbox === 'archive'){
            document.querySelector('#emails-view').append(archieve_button);
          }
          
          const reply_button=document.createElement('button');
          reply_button.innerHTML="Reply";
          reply_button.addEventListener('click', function() {
            compose_email();
            document.querySelector('#compose-recipients').value = email.sender;
            let subject = email.subject;
            if(subject.split(' ', 1)[0] != "Re:") {
              subject = "Re: " + email.subject;
            }
            document.querySelector('#compose-subject').value = subject;
            document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;          
          });
          document.querySelector('#emails-view').append(reply_button);
        })

        
        
        //Color change if email is read
        if (email.read === false){
          element.style.backgroundColor = "grey";
        }
        else{
          element.style.backgroundColor = "white";
          element.style.color = "black";
        }
        //Inbox
        var user;
        if (mailbox === 'inbox' || mailbox === 'archive'){
          user = email.sender;
        }
        if(mailbox === 'sent'){
          user = email.recipients;
        }
        element.className= "list-group-item";
        element.innerHTML = `
        <h6>${user}</h6>
        <medium>${email.subject}</medium>
        <p><small>${email.timestamp}<small></p>
        <input value=${open_email.id} id="email-id"type="hidden>`
        
      document.querySelector('#emails-view').append(element);        
      });      
    });
}

