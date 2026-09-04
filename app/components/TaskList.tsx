interface TaskListItem {
  name: string;
  hint?: string;
  status: "completed" | "in-progress" | "todo" | "cannot-start";
  href?: string;
}

interface TaskListProps {
  items: TaskListItem[];
  title?: string;
}

export default function TaskList({ items, title }: TaskListProps) {
  const statusLabels = {
    completed: "Completed",
    "in-progress": "In progress",
    todo: "To do",
    "cannot-start": "Cannot start yet",
  };

  const statusColors = {
    completed: "govuk-task-list__status--completed",
    "in-progress": "govuk-task-list__status--in-progress",
    todo: "govuk-task-list__status--todo",
    "cannot-start": "govuk-task-list__status--cannot-start",
  };

  return (
    <section className="govuk-task-list" aria-labelledby={title ? "task-list-title" : undefined}>
      {title && <h2 id="task-list-title" className="govuk-heading-m mb-4">{title}</h2>}
      <ul className="govuk-task-list__items">
        {items.map((item, index) => (
          <li key={index} className="govuk-task-list__item">
            <div className="govuk-task-list__name-and-hint">
              {item.href ? (
                <a href={item.href} className="govuk-task-list__link">
                  {item.name}
                </a>
              ) : (
                <span className="govuk-task-list__name">{item.name}</span>
              )}
              {item.hint && (
                <p className="govuk-task-list__hint">{item.hint}</p>
              )}
            </div>
            <span className={`govuk-task-list__status ${statusColors[item.status]}`}>
              {statusLabels[item.status]}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}