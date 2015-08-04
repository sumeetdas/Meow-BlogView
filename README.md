# Meow-BlogView
Angular module used with Meow blogging engine to view blogs.

### Features

* This module is created using angular-ui-router.

* It leverages the responsive utility classes provided by bootstrap to help the app adapt to various screen sizes.

* It includes various social sharing options, viz. sharing on facebook, twitter, google and linkedin. 

* It includes disqus directive which will be added in each blog post

* It has a search feature which will help users to search titles, tags and keywords

* It contains tags which will help crawlers and social sites like Facebook to extract important information from your post

### Installation

Run the following command:

```
bower install meow-blogview
```

and add the following lines in the head tag of your index.html file:

```html
<head>
  <!-- other contents -->
  <link rel="stylesheet" href="/bower_components/meow-blogview/dist/css/meow-blogview.min.css"/>
  <script src="/bower_components/meow-blogview/dist/meow-blogview.min.js"></script>
  <script>
    angular.module('app', ['meow.blog.view']);
  </script>
  
  <!-- other contents -->
</head>
```

and finally add this tag inside your body tag:

```html
<body>
  <!-- other contents -->
  
  <div ui-view="blogView"></div>
  
  <!-- other contents -->
</body>
```

and you are done with the setup!

### LICENSE

MIT License, Copyright (c) 2015 Sumeet Das
