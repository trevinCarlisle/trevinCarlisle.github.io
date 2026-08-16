# Trevin Carlisle Professional ePortfolio
## Data Dashboard Enhancement Capstone Project
### Professional Self-Assessment

The development process of this ePortfolio has served to prepare me for entry into the computer science field by helping me understand and showcase my strengths as a software engineer and data analyst. The work shown below, along with the rest of my computer science degree, has addressed competency in collaborating in a team development environment, communication with stakeholders, data structures and algorithms, software engineering and database management, and programming security. 

While this project was done solo, I received weekly feedback from my instructor on my progress in the digital equivalent of a scrum stand-up. I have also learned the agile Scrum framework and utilize it in my daily work outside of my schooling.

A core ability this process has strengthened is my communication abilities. This skill has progressed in four ways. The first is the project itself. A data dashboard is, at its core, a visual communication tool. It explains complex data in a simple, easily understood manner. Its intention is to be as intuitive as possible, making sure that even a non-technical audience can glean valuable insights at a glance. The code review below is the second example of my communication skills being tested and enhanced. The review is a more technical communication, analyzing the original artifact that was refactored for this portfolio. It shows that I can evaluate important insights without bias, and then give those insights to an audience with technical knowledge, but no hands-on knowledge of the specific program at hand. The third method of communication was weekly progress updates delivered to an instructor. These updates were evaluated, suggestions were made by the instructor, and then those changes were implemented and sent back for another cycle of evaluation. The fourth and final method of communication is this portfolio itself. Between the video code review, several explanatory text entries, architecture diagrams, and the comments within the available code, I have successfully communicated the ins and outs of this portfolio artifact.

In the full-stack implementation, loading thousands of animal records from the public Austin Animal Shelter database directly to the frontend viewport caused incredibly slow loading times and severe lag. I solved this by designing and implementing a server-side pagination engine. This only loads a few records at a time by shifting parameters for the current page and the number of records shown at a time to the database layer. This, in turn, keeps network payload at a constant, manageable size and speeds the load of the page. I also sped up loading times and avoided site crashes by creating data validation checkpoints like the schema for the Animal JSON object and implementing the compound Mongoose indexes for each type of rescue animal, so each individual record doesn't need to be searched every time a button is pressed on the site.

The migration of roughly 300 lines of Python script to a fully developed MEAN stack represents a significant leap in my abilities as a software engineer. The frontend view uses Angular components to clearly display the data in various forms, with Signals implemented for immediate change detection without any major overhead costs. This allows for fast reloading of individual parts of the site instead of a costly, full-page reload every time the user interacts with a part of the site. The Express and Node.js API wrapper is built to run asynchronously, so the paginated data grid and the analytic counts for the pie chart can both be calculated in a single database pass.

Security has also been an important part of developing this portfolio. I designed the architecture of this dashboard with security in mind, making sure database elements could not be accessed or edited by the user. I also ensured the MongoDB login strings, server configuration, and encryption are completely removed from source code files. You will not see these portions of the program in the files below. Instead, it's embedded in the root .env file configuration. Passwords here are never exposed to public versions of the site and are not tracked in the repository. There's also a strict whitelist matrix in the application setup to ensure that only requests originating from the trusted Angular application are processed. This way, external query attacks are impossible from the frontend of the site.

Due to the scale of this project, I chose to include only one completely overhauled artifact in this portfolio as opposed to 2-3 partially refactored projects. However, this one artifact showcases a very large range of computer science skills. The artifact below takes a one-page monolith of a Python script with a small helper module and transforms it into a MEAN stack web application. The full-stack application highlights my ability to write clean, well-organized, and well-documented code. It also displays my ability to build secure backend APIs, responsive user interfaces, and optimized database pipelines.

---

### Code Review

<video width="100%" height="auto" controls>
  <source src="assets/code-review.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

This video (runtime 32:53) walks through the .ipynb module that powers the original data dashboard that this project enhances, highlighting issues that need to be resolved in the enhancement.

---

### Original Artifact and Enhancement
#### Original Artifact: CS 340 Project Two - Python Data Dashboard

You can access the complete raw source code for the original Python script here:
> [Jupyter Notebook Artifact](assets/ProjectTwoDashboard.ipynb)
> 
> [Python CRUD Helper Module](CRUD_Python_Module.py)

#### Enhanced Artifact: CS 499 Capstone Enhancement - MEAN Stack Data Dashboard

You can access the complete raw source code for the enhanced MEAN Stack dashboard here:
> [Angular Frontend Client Code](./client)
>
> [Node.js and Express Backend Server Code](./server)

*Database Query Diagram*
![Enhanced Dashboard Screenshot](assets/Database_Queries_Diagram.png)

The Python data dashboard was a final project from a previous course in my computer science program. It was rushed and needed some improvement, even if it were to stay in Python. However, I chose to update it to a full MEAN stack application to push myself and fully demonstrate my abilities as a programmer. This project was developed for the capstone of my computer science degree, so I wanted to make a very big change. I chose this artifact because I really enjoyed the idea of it and the initial development, but I knew I could've done better. I wanted to do justice to this project that I enjoyed so much. 

The big change for this enhancement is obviously that the entire platform the program is developed on has undergone a complete overhaul. Beyond this large change, I implemented a few other things to make the artifact more efficient and optimized. Defining a schema for the Animal JSON object and defining compound indexes directly in MongoDB streamlines the processes of importing and filtering data to stream to the UI. Additionally, I wrote an in-database feature-mining analytics route. This framework allows the optimized C++ engine in MongoDB to deliver data structures to the Angular frontend elements. 

As I was creating the enhanced artifact, I learned a few new things and strengthened my skills in other areas. I learned how to create visual data dashboard elements that update live, and how to split and paginate data to speed up loading times for a website. I also strengthened my skills in data analytics, visual communication, web development, and database management. A big challenge I faced in creating and updating this dashboard was the location data. When pulling data from the Austin Animal Shelter's public records, there was no location data for any of the animals in their records. Despite this, the original project's data dashboard had location data and a Leaflet map showing every animal's location. I reached out to the instructor for the course this artifact came from originally, asking where this location data came from, only to receive no response. In lieu of any sort of reply from my previous professor, I opted to, as a temporary placeholder, generate randomized locations for each animal. If my instructor responds at any point, I will update the project with proper data, but for now, each animal is randomly placed at some point within roughly 20 miles of the Austin Animal Shelter. This is mainly to bypass that small hurdle so I could demonstrate my ability to functionally implement a Leaflet map. 
