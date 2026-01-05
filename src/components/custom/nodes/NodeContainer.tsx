interface NodeContainerProps {
  children: React.ReactNode;
  id?: string;
}

export default function NodeContainer({ children, id }: NodeContainerProps) {
  return (
    <div aria-label={`Node ${id}`} className="bg-white rounded shadow-md p-0 min-w-32">
      {children}
    </div>
  )
}
