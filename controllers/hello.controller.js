const hello = async (req, res) => {
    try {
        res.json({
            fruits: ['banana', 'apple', 'orange'],
        });
    } catch (error) {
        console.error('Error in hello controller:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

module.exports = {
    hello,
};
