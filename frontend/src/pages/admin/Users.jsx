import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { deleteUserRequest, listAdminUsersRequest, updateUserRoleRequest } from "../../services/admin";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    listAdminUsersRequest()
      .then(response => setUsers(response.users))
      .catch(error => console.error("Erro ao listar usuários:", error))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleRole = async targetUser => {
    const nextRole = targetUser.role === "admin" ? "user" : "admin";
    try {
      await updateUserRoleRequest(targetUser.id, nextRole);
      setUsers(current => current.map(item => (item.id === targetUser.id ? { ...item, role: nextRole } : item)));
    } catch (error) {
      console.error("Erro ao atualizar papel:", error);
    }
  };

  const remove = async id => {
    if (!window.confirm("Remover este usuário?")) return;
    await deleteUserRequest(id).catch(error => console.error("Erro ao remover usuário:", error));
    setUsers(current => current.filter(item => item.id !== id));
  };

  if (loading) return <div className="card p-6 text-slate-500">Carregando usuários...</div>;

  return (
    <div className="card overflow-x-auto p-4">
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead>
          <tr className="border-b text-slate-500">
            <th className="p-3">Nome</th>
            <th className="p-3">E-mail</th>
            <th className="p-3">Papel</th>
            <th className="p-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map(item => (
            <tr key={item.id} className="border-b last:border-none">
              <td className="p-3 font-semibold">{item.name}</td>
              <td className="p-3 text-slate-500">{item.email}</td>
              <td className="p-3">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${item.role === "admin" ? "bg-dts-100 text-dts-700" : "bg-slate-100 text-slate-600"}`}>
                  {item.role}
                </span>
              </td>
              <td className="p-3 space-x-3">
                <button onClick={() => toggleRole(item)} disabled={item.id === currentUser.id && item.role === "admin"} className="font-semibold text-dts-600">
                  {item.role === "admin" ? "Remover admin" : "Tornar admin"}
                </button>
                <button onClick={() => remove(item.id)} disabled={item.id === currentUser.id} className="font-semibold text-red-600">Remover</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
