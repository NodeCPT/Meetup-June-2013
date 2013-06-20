Meetup-June-2013
================

A service bus that demonstrates the use of node for distributed computing or integration

Presentation: https://www.dropbox.com/s/7dsj9txx076o1b7/hands%20on%20node.pptx

1. Download from Git
2. Open a console window in the root of the app - the folder should be June-Meetup-2014
3. Run npm install
4. In the root folder execute the following:  ‘node server name=primary’ 
5. Open up your browser to http://localhost:3333/flowchart.html - you should see a page with the text: Server listening on:localhost:3333 in the top left corner
6. Open a new console window, and again navigate to the June-Meetup-2014 folder, execute the following: ‘node server mode=client name=test1 port=3334 server_port=3333 server_ip=127.0.0.1’
7. Your web page should have a new shape on it called test1 – which you can drag around.
8. Again, open a new console window, and again navigate to the June-Meetup-2014 folder you have just unzipped, execute the following: ‘node server mode=client name=test2 port=3335 server_port=3333 server_ip=127.0.0.1’
9. Your web page should have a new shape on it called test2.
10. Now, join small dot on the right side of shape test1 to the large dot on shape test2 by clicking and dragging the small dot towards the other shape – when you release the mouse the shapes will be joined.
11. After the shapes are joined – press the execute button (lightening bolt) on the top right corner of the web page – this will execute the distributed process you have just orchestrated.
12. Completed steps turn green, and finally you will get the payload of the distributed process displayed on the page.
