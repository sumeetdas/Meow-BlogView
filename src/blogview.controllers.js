/**
 * Created by sumedas on 30-Apr-15.
 */
angular
    .module('meow.blog.view')
    .controller('BlogViewListCtrl', ['$scope', '$blogView', '$state', 'meta', function ($scope, $blogView, $state, meta) {

        $scope.username = meta.username;

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
    .controller('BlogViewPostCtrl', ['$scope', '$stateParams', '$blogView', '$location', 'meta', function ($scope, $stateParams, $blogView, $location, meta) {
        $blogView.getBlog({
            year: $stateParams.year,
            month: $stateParams.month,
            date: $stateParams.date,
            slug: $stateParams.slug
        }, function (pBlog) {
            $scope.blog = pBlog;
        });

        $scope.getFormattedDate = function (pBlog) {
            if (!pBlog || !pBlog.fileName)
            {
                return '';
            }
            return $blogView.parseFileName(pBlog.fileName).formattedDate;
        };

        $scope.username = meta.username;

        meta.disqus = meta.disqus || {};

        $scope.disqus = {
            shortname: meta.disqus.shortname,
            id: $location.url(),
            url: $location.absUrl()
        };
    }])
    .controller('BlogViewPostSideCtrl', [function () {

    }])
    .controller('BlogViewCtrl', ['$blogView', '$scope', '$state', function ($blogView, $scope, $state) {

        $scope.search = function () {
            $state.go('blog.list.query', {
                query: $scope.query
            });
        };
    }]);