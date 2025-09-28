# ApartmentRentalDiscordNotification
A script that pulls apartment details from email and notifies in Discord channel

The Discord channel has a webhook that is used for the script. The script is triggered once a day to pull the most recent email notifications, send the apartment listings in a batch to the Discord. 

I had the script running through Google Scripts. 
The email was a gmail email, so I used the built in functions to search gmail for new renthop emails. 
The emails were then scraped for the apartment info and sent in a reformatted message to Discord. 
