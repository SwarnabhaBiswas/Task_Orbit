function TaskCard({ title, description, status }) {
  const statusColor =
    status === "Completed"
      ? "bg-green-200 text-green-800"
      : status === "Pending"
      ? "bg-yellow-200 text-yellow-800"
      : "bg-gray-200 text-gray-800";

  return (
    <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
      <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
      <span className={`text-xs px-2 py-1 rounded-full ${statusColor} mt-2 inline-block`}>
        {status}
      </span>
    </div>
  );
}
export default TaskCard;
