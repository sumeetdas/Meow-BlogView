/**
 * Created by sumedas on 30-Apr-15.
 */
angular
    .module('meow.blog.view')
    .controller('BlogViewListCtrl', ['$scope', '$blogView', '$state', 'meta', function ($scope, $blogView, $state, meta) {

        $scope.username = meta.username;

        meta.angularSocialShare = meta.angularSocialShare || {};

        meta.angularSocialShare.twitter = meta.angularSocialShare.twitter || {};

        $scope.twitterHandle = meta.angularSocialShare.twitter.handle || '';

        /**
         * Load blogs on state change
         * This controller is used by two states and is required to load
         * blogs based on whether the URL is /blogs/tag/:tag, /blogs/query/:query or just /blogs.
         */
        $scope.$on('$stateChangeSuccess', function loadBlogs () {

            if (!! $state.params.tag)
            {
                $blogView.getBlogsByTag($state.params.tag, function (pData) {
                    $scope.blogs = pData;
                }, meta.blogsPerPage);
            }
            else if (!! $state.params.query)
            {
                $blogView.getBlogsByQuery($state.params.query, function (pData) {
                    $scope.blogs = pData;
                }, meta.blogsPerPage)
            }
            else
            {
                $blogView.getBlogs(function (pData) {
                    $scope.blogs = pData;
                }, meta.blogsPerPage);
            }
        });
        // load next set of blogs
        $scope.next = function () {
            $blogView.getNextBlogs(function (pData) {
                $scope.blogs = pData;
            }, meta.blogsPerPage)
        };
        // load previous set of blogs
        $scope.prev = function () {
            $blogView.getPrevBlogs(function (pData) {
                $scope.blogs = pData;
            }, meta.blogsPerPage);
        };
        // determine if the current page is the first page of the result list
        $scope.isFirstPage = function () {
            return $blogView.getCurrentPageNo() === 1;
        };
        // determine if the current page is the last page of the result list
        $scope.isLastPage = function () {
            return $blogView.getCurrentPageNo() === $blogView.getPageCount();
        };
        $scope.getFormattedDate = function (pBlog) {
            if (!pBlog || !pBlog.fileName)
            {
                return '';
            }
            return $blogView.parseFileName(pBlog.fileName).formattedDate;
        };
        // function to go to blog.view state when the title is clicked upon
        $scope.goToBlog = function (pBlog) {
            var metaData = $blogView.parseFileName(pBlog.fileName);

            $state.go('blog.view', {
                year: metaData.year,
                month: metaData.month,
                date: metaData.date,
                slug: metaData.slug
            });
        };
    }])
    .controller('BlogViewPostCtrl', ['$scope', '$stateParams', '$blogView', '$location', 'meta', '$rootScope',
	function ($scope, $stateParams, $blogView, $location, meta, $rootScope) {
        $blogView.getBlog({
            year: $stateParams.year,
            month: $stateParams.month,
            date: $stateParams.date,
            slug: $stateParams.slug
        }, function (pBlog) {
            $scope.blog = pBlog;

            $rootScope.metaTags = {
                twitter: [{
                    name: 'twitter:card',
                    content: 'summary'
                }, {
                    name: 'twitter:title',
                    content: pBlog.title
                }, {
                    name: 'twitter:description',
                    content: pBlog.subtitle
                }, {
                    name: 'twitter:url',
                    content: $location.absUrl()
                }, {
                    name: 'generator',
                    content: 'Meow'
                }],
                og: [{
                    property: 'og:site_name',
                    content: meta.username
                }, {
                    property: 'og:type',
                    content: 'article'
                }, {
                    property: 'og:title',
                    content: pBlog.title
                }, {
                    property: 'og:description',
                    content: pBlog.subtitle
                }, {
                    property: 'og:url',
                    content: $location.absUrl()
                }, {
                    property: 'article:published_time',
                    content: $scope.getFormattedDate(pBlog, true)
                }],
                tags: pBlog.tags,
                title: pBlog.title
            };
        });

        $scope.getFormattedDate = function (pBlog, pIsMeta) {
            if (!pBlog || !pBlog.fileName)
            {
                return '';
            }

            if (!pIsMeta) {
                return $blogView.parseFileName(pBlog.fileName).formattedDate;
            }
            else {
                var parsedData = $blogView.parseFileName(pBlog.fileName);
                return parsedData.year + '-' + parsedData.month + '-' + parsedData.date;
            }
        };

        $scope.username = meta.username;

        meta.disqus = meta.disqus || {};

        $scope.disqus = {
            shortname: meta.disqus.shortname,
            url: $location.absUrl()
        };
    }])
    .controller('BlogViewPostSideCtrl', [function () {

    }])
    .controller('BlogViewCtrl', ['$blogView', '$scope', '$state', '$location', function ($blogView, $scope, $state, $location) {

        $scope.search = function () {
            $state.go('blog.list.query', {
                query: $scope.query
            });
        };

        $scope.siteUrl = $location.absUrl();
    }]);