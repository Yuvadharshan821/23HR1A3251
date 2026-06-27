const loadData = async () => {
  try {
    setLoading(true);
    setError("");

    const res = await fetchNotifications(token, filter, page);

    console.log("FULL API RESPONSE:", res);

    const list =
      res.notifications ||
      res.data ||
      res ||
      [];

    setNotifications(Array.isArray(list) ? list : []);
  } catch (err) {
    setError(err.message);
    setNotifications([]);
  } finally {
    setLoading(false);
  }
};