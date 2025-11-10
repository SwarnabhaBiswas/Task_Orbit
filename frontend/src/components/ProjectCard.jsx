function ProjectCard({ name, deadline, progress }) {
  return (
    <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-xl transition">
      <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
      <p className="text-sm text-gray-500 mt-1">Deadline: {deadline}</p>
      <div className="w-full bg-gray-200 h-2 rounded mt-3">
        <div
          className="bg-blue-500 h-2 rounded"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-xs text-right text-gray-600 mt-1">{progress}% complete</p>
    </div>
  );
}
export default ProjectCard;
