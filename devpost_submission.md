## Devpost content
## Written by: Sarah Sargent
## Date: March 15, 2026, 3:11am

## Inspiration

## What it does
Below is a **clean, polished Devpost “About the Project” section** rewritten from your notes. I preserved your **story, personal inspiration, and technical details**, but structured it clearly and professionally in **Markdown**, which Devpost supports.

You can paste this directly into Devpost.

---

# About the Project

## Inspiration

Sentinel was inspired by the people in our lives who interact the least with technology—but could benefit the most from it.

Several of us have experienced firsthand how dangerous falls can be. One of our teammates had multiple grandparents suffer serious hip injuries from falls. Another teammate’s mother works as a physical and occupational therapist and has shared many stories about how common and devastating fall-related injuries can be, especially among elderly patients.

We were also deeply influenced by a personal experience involving a neighbor who frequently fell at home. One day she was stuck at the bottom of a staircase for nearly an hour before someone discovered her. Eventually, she had to move into a nursing home because she could not safely live independently.

These experiences made us ask a simple question:

**What if AI could watch over the physical world and help people when no one else is around?**

Sentinel was created to explore that idea.

---

## What it does

Sentinel is a **low-cost, AI-powered vision monitoring platform** designed to observe and understand real-world environments.

The system uses a camera and AI vision models to detect people, recognize faces, and track individuals in real time. When activity is detected, Sentinel can analyze the situation, communicate observations, and send alerts to caregivers, family members, or other stakeholders.

Key capabilities include:

* Face detection and facial recognition
* Identity tracking
* Real-time movement tracking with a **motorized two-axis camera mount**
* Spatial awareness to understand where people are in a room
* Voice interaction through a speaker and microphone
* Messaging alerts through Telegram
* Time-stamped event logging for later review

Unlike traditional security cameras, Sentinel actively **follows people with its camera using servo motors**, allowing the system to track individuals as they move through a space.

The system can also communicate what it sees through voice output or messaging systems, creating a bridge between the physical environment and digital communication channels.

Sentinel was designed to be **accessible and low-cost**, with a total hardware cost of under **$150**, and it can be assembled from scratch in under **24 hours**.

---

## How we built it

Sentinel combines hardware systems, AI software, and real-time communication tools.

We began by designing the overall **system architecture**, identifying which components would handle sensing, reasoning, and communication.

The hardware stack includes:

* A **Raspberry Pi** for AI processing
* An **Arduino** microcontroller to control sensors and movement
* A **camera module** for visual input
* A **two-axis pan-tilt mount powered by servo motors** to physically track motion

On the software side, we implemented a vision detection pipeline that allows the system to detect people, recognize faces, and analyze spatial positioning.

Once detection occurs, the system can trigger actions such as:

* sending alerts via **Telegram**
* speaking responses using voice output
* logging events for later analysis

We iterated rapidly—building a basic pipeline first and then continuously debugging and improving it until we achieved a working prototype.

The servo-controlled camera mount was also customized and refined to reliably follow detected motion.

---

## Challenges we ran into

Building a system that connects **AI software with physical hardware** presented several challenges.

One of the biggest hurdles was ensuring compatibility between hardware components. Setting up the Raspberry Pi and Arduino required careful configuration of ports, drivers, and communication protocols.

We also encountered challenges with:

* correctly flashing operating systems and software onto devices
* managing serial communication between hardware controllers
* debugging real-time vision detection pipelines
* coordinating multiple subsystems such as movement, vision, and messaging

On the software side, debugging and improving the detection pipeline required multiple iterations to ensure the system could reliably detect and track people.

From a project management perspective, another challenge was deciding which use case to focus on and how to communicate our ideas clearly within the short time frame of the hackathon.

---

## Accomplishments that we're proud of

We are incredibly proud of how far we were able to push this project within such a short time frame.

Our team traveled from **California and Notre Dame**, and despite being a small team of 2 with limited time, we were able to build a fully functioning physical AI prototype.

Key accomplishments include:

* Building a working **AI vision detection system**
* Implementing **facial recognition and identity tracking**
* Creating a **servo-based camera mount that follows people**
* Integrating voice output and messaging alerts
* Developing a working prototype in only a few hours of focused development

Beyond the technical achievements, we are also proud of the collaborative effort. The project benefited from the support of mentors, organizers, and the hackathon community.

Sentinel represents not just a finished prototype—but the **beginning of a much larger idea**.

---

## What we learned

This project taught us how to move quickly, prioritize effectively, and focus on building a **minimum viable product (MVP)** before attempting to perfect every detail.

We learned to play to our strengths as a team:

* One teammate focused on coding and AI integration
* The other focused on hardware development, system design, and presenting the project’s real-world use cases

We also learned the importance of staying focused on the final goal while remaining flexible about the path to get there. Sometimes the most effective solution is not the most complex one—simple tools or even analog methods can sometimes work better than over-engineered solutions.

Most importantly, we learned how powerful it can be when **AI systems interact with the physical world rather than only existing in software.**

---

## What's next for Sentinel

Sentinel is only the beginning.

Our long-term vision is to make **AI-powered physical intelligence accessible to everyone—not just developers and engineers, but also everyday people.**

We want to create systems where users don’t need to write code. Instead, they can simply ask the system questions or give instructions, and the AI will observe, reason, and respond.

Future directions for Sentinel include:

* improved activity and behavior recognition
* fall detection and healthcare monitoring
* smart home integration
* real-time emergency response alerts
* expanded spatial reasoning capabilities

We are also interested in collaborating with **research labs exploring humanoid robotics and embodied AI**, where systems like Sentinel could help robots perceive and understand their environments.

Ultimately, we believe the future of AI is not just about text and software—it is about **AI that can see, understand, and interact with the real world.**


## Built with:
## What languages, frameworks, platforms, cloud services, databases, APIs, or other technologies did you use?

## "Try it out" links
## Add links where people can try your project or see your code.
