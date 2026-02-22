import Order from "../models/Order.js";

// CREATE ORDER (guest or logged-in user)
export const createOrder = async (req, res) => {
  const { items, shippingAddress } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart empty" });
  }

  try {
    // Build order items directly from frontend data
    const built = items.map((it) => ({
      productId: it.productId, // frontend string ID
      productSnapshot: it.productSnapshot,
      quantity: it.quantity,
      unitPrice: it.unitPrice ?? it.productSnapshot?.price,
    }));

    // Calculate total
    const total = built.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

    const userId = req.user ? req.user._id : null;

    // Create order in DB
    const order = await Order.create({
      user: userId,
      items: built,
      totalAmount: total,
      shippingAddress,
      currency: "USD",
      status: "pending",
    });

    res.status(201).json({
      orderId: order._id,
      totalAmount: order.totalAmount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET ORDER BY ID (user or admin)
export const getOrderById = async (req, res) => {
  try {
    // Find order by ID and populate user info
    const order = await Order.findById(req.params.id).populate(
      "user",
      "email firstName role"
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Access control:
    // - If order belongs to user → allow
    // - If user is admin → allow
    // - Otherwise → forbidden
    if (
      req.user &&
      order.user &&
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};