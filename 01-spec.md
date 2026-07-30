we are making a website for ycc (Yuva Champions Cricket) which is mobile first as most users and staff and admin will use it from a mobile phone. it is a platform where people can come and register their teams for cricket championships and Quiz competitions. This is mainly focused for college students. (this is a sample website UI for your reference https://gujaratcricketleague.com).

it has a blue and white theme similar to its logo.

people can pay for quiz (individual) or box cricket (Team)

quiz information modal format: name, college, mobile no (unique id will be generated and given in receipt)

box cricket information modal format: team name, team members (name, college, mobile no [will give + option for adding more]), (team unique id will be generated and given in receipt)

colleges dropdown (only these colleges for now, more will be added later): D.C. Patel, Sascma College, Udhna Citizen, CK Pithawala, Bhagwan Mahavir University, SCET, Ambaba College

# tech stack

react.js, tailwind css, node.js with razorpay integration, shadcn ui, supabase for database, vercel for hosting.

## User flow

users:

1. User comes to website
2. User sees a landing page, and selects the event they want to register for
3. User fills the form and submits it (i will upload the form format)
4. User gets redirected to payment gateway (razorpay integration)
5. User completes the payment
6. User gets confirmation email with a receipt (i will upload the receipt format)
7. the receipt will contain a unique ID, (format : college_initial + group_number + number. EX: CKG1001.....here CK = college initials, G1 is the group 1 from that college which consists of 150 people, and 001 is the serial number from 001 to 150.....after 150, the group becomes G2.)
8. we will integrate a QR code in the receipt which will allow our staff to scan it and verify the user. (i am thinking of making the QR code with the unique ID. when that unique id is scanned, that person (if quiz) / team (if cricket) details should appear on the staffs screen with an absent or present tickmark so staff can mark them).

staff:

1. all the staff can login from a single gmail id (correct me if multiple is good or single gmail id for all is better), and scan the QR code which the users show to them on the booth and verify and tickmark them as present (they will be marked present once the scanning is verified). (add in features like they can search for the user by name or college initial or unique id or group number or roll number and verify and tickmark/untick them as present or absent, add all necessary details if i am missing something).

admin:

1. the admin will login from different gmail, and a new admin dashboard will open for him (i think we should make a dedicated page for him.)
2. admin will be having the overall picture of the number of teams registred for a particular event, number of people registered for a particular event, total money collected for a particular event, number of people present and absent for a particular event (which can be seen for each college or overall, but i prefer if he can see overall data and he can click on a college to see details of a particular college). the admin should be able to see a detailed visual chart report of all the colleges and users and teams and his staff.
3. he will also be able to see and export a .CSV file of all the payment made for his CA.

ask me things if necessary, all the formats and logo that you will need are inside assets folder in this /ycc directory.
also tell me steps in between when you need razorpay integration and supabase connection etc etc for API keys.
