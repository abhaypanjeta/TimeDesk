const Event = require('../models/Event');

// @desc    Get events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
    const events = await Event.find({ user: req.user.id });
    res.status(200).json(events);
};

// @desc    Set event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
    if (!req.body.title) {
        res.status(400).json({ message: 'Please add a text field' });
        return; // Ensure function exits
    }

    const event = await Event.create({
        title: req.body.title,
        category: req.body.category,
        priority: req.body.priority,
        date: req.body.date,
        time: req.body.time,
        description: req.body.description,
        user: req.user.id,
    });

    res.status(200).json(event);
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(400).json({ message: 'Event not found' });
        return;
    }

    // Check for user
    if (!req.user) {
        res.status(401).json({ message: 'User not found' });
        return;
    }

    // Make sure the logged in user matches the event user
    if (event.user.toString() !== req.user.id) {
        res.status(401).json({ message: 'User not authorized' });
        return;
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    res.status(200).json(updatedEvent);
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(400).json({ message: 'Event not found' });
        return;
    }

    // Check for user
    if (!req.user) {
        res.status(401).json({ message: 'User not found' });
        return;
    }

    // Make sure the logged in user matches the event user
    if (event.user.toString() !== req.user.id) {
        res.status(401).json({ message: 'User not authorized' });
        return;
    }

    await event.deleteOne();

    res.status(200).json({ id: req.params.id });
};

module.exports = {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
};
