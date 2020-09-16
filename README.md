# Perkticular
### A Place for your Inner Coffee Critic
Perkticular tracks what you’ve liked and disliked about coffee shops, that way you can make your shop and drink choices with confidence. 

You can add drinks and shop aspects about specific places, and rank these drinks/aspects against others of the same type to establish favorites. The homepage displays a map of shops you've had good experiences in, and has options to view drinks, shop aspects, or both kinds of features. The goal of Perkticular is to make it easy to see your past opinions to inform your decision-making process when choosing a coffee shop, so you always end up with the experience you're looking for. So, if you’re picky about your coffee shops, check out Perkitcular!

## About Me
Glorilí Alejandro grew up drawing on every surface she encountered. She enjoys figuring out the intricacies of how things work and their effects on the big picture, and uses this skill for good (how do we prevent errors on this accounting spreadsheet?) and evil (how do I get my introverted friend to sing karaoke in public?). 

Glorilí first encountered coding while animating videos for her art degree at Yale University. After discovering UX design, she became a founding member of the design team at a database software firm. She returned to the arts with new skills, building systems for an arts education non-profit. Glorilí aims to continue building systems with an eye for design, this time in software. She brings her abilities to bridge gaps between engineers and users, and solve complexity with creativity.

## Contents
* [Tech Stack](#tech-stack)
* [Features](#features)

## <a name="tech-stack"></a>Technologies
* React
* Python
* Javascript
* Flask
* PostgresQL
* SQLAlchemy ORM
* HTML
* CSS
* Bulma
* Google Maps API

## <a name="features"></a> Features

#### Home Page
Users are greeted with a map created using the Google Maps Javascript API. The markers on this map correspond to information about shops, drinks, or shop aspects, depending on the chosen view. Details are provided through the cards on the right. 

![home page](/images_for_readme/homepage.png)

#### Add a Drink/ Shop Aspect
When a user wants to log a their thoughts about a particular shop's drink, or an aspect of the shop itself like seating or privacy, they can add it along with details and a nickname. A user also indicates if they like or dislike this addition, which determines whether they go to the rankings page or the home page after submitting their addition.

![add a new drink or shop aspect](/images_for_readme/add-new.png)

#### Rankings
A user can rank any kind of feature, be it a drink (ex: latte) or a shop aspect (ex: barista friendliness) against others of its type to keep track of their favorites. This draggable interface, made possible by React hooks and CSS, allows for users to adjust the order of favorites at any time.

![rankings](/images_for_readme/rankings.png)

#### Edit Details
If a user changes their mind about a feature they've already added, they can edit the details about it through a modal window, and even change whether it is liked or disliked. The date of this update is displayed in the details for reference.

![edit details](/images_for_readme/edit-details.png)


