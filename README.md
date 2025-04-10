# NUHire

NUHire is a web application that simulates the job application process. In the simulation, the students get to play the part of employers reading through a job-description and reviewing resumes, conducting job-interviews and making decisions based on a real-world hiring process.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Build and Installation](#build-and-installation)
- [Usage](#usage)
- [Project Images](#project-images)


## Overview

NUHire is desinged fo reducation purposes, helping students understand the employer's perspective. Students will be in groups and the advisor can make these groups and assign each group a job description. From there students will be going through the job description, look at resumes for potential candidates, interview them and make an offer. Students who play as employers will be able to also deal with tardiness in candidates, internal refferals, etc. in real time to simulate a real-world hiring process faciliatated through web sockets. 

![Screenshot](/project-screenshots/landing_page.png)

## Features

- **Simulation Process**: Students engage in multiple step process simulating what a hiring team goes through while selecting candidates for a job position. This includes reading job description, reading resumes under a time crunch, conducting interviews and evaluating the candidate's responses, group discussions for making offers and selecting an candidate while dealing with potential roadblocks that employers have to deal with while making a decision. 
- **Real Time Interaction**: Uses Socket.IO to provide real updates to students from the advisor who can monitor the student's stage of the simulation, allows groups of students to come together and make decisions about resumes and interviews.
- **Dynamic Content**: Groups, Job description and Resumes are dynamically assigned by the advisor in a class.
- **Dockerized Environment**: SImplifies develop and deployment through docker and docker-compose.

## Tech Stack
- Frontend: Built with Next.js, React, and Tailwind CSS.
- Backend/API: Built with Express.js and Node.js 
- Database: MySQL
- Real-time Communication: Socket.IO
- Containerization: Docker and docker-compose. 

## Build and Installation 

For the build instructions and running the application locally please refer to the build instruction file here: [Build Instructions](BUILD.md). 

Run the application locally here:

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit and save the file.

## Usage

### Students: 
Log in to complete the simulation, groups along with job descriptions and resumes will be assigned by the advisor and students have to go through each of the stage completing them. They will have the ability to return back to the dashboard and jump back to the pages where they left off. They will be able to complete the simualtion when they send out offers and get through the what would an employer do page. 

### Advisor: 
Advisors after they log in, will be able to see all the students that are in their class, assign the groups along with their job description and monitor the students in their groups as they go through the simualtion. If every need be to send popups, they can do so and select any of the preset highlights or type up a custom message choosing to notify any of the groups they would like to. 

## Project Images

Student-dashboard: 
![Screenshot](/project-screenshots/student_dashboard.png)

Advisor dashboard: 
![Screenshot](/project-screenshots/advisor_dashboard.png)


## PREWRITEN GOTTEN FROM USING REACT
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

