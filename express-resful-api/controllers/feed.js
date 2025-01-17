exports.getPosts = (req, res, next) => {
    return res
        .status(200)
        .json({
            posts: [
                {
                    _id: 1,
                    title: 'First Post',
                    content: 'This is the first post!',
                    imageUrl: 'images/istockphoto-1045035708-612x612.jpg',
                    creator: {
                        name: 'Egan'
                    },
                    createdAt: new Date(),
                }
            ]
        })
}

exports.createNewPost = (req, res, next) => {
    const { title, content, imageUrl } = req.body;
    res.status(201)
        .json({
            message: 'Post created successfully.',
            post: {
                _id: 2,
                title,
                content,
                imageUrl,
                creator: {
                    name: 'Egan'
                },
                createdAt: new Date(),
            }
        });
}