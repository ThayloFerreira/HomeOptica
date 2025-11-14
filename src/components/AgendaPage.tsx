import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Doc, Id } from "../../convex/_generated/dataModel";

// Componente para a página de Agendamentos

export function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const appointments = useQuery(api.appointments.listByDay, { date: selectedDate.getTime() });
  const clients = useQuery(api.clients.list);
  const createAppointment = useMutation(api.appointments.create);
  const cancelAppointment = useMutation(api.appointments.cancel);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 10) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const bookedTimes = new Set(appointments?.map(app => new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })));

  const handleOpenModal = (time: string) => {
    setSelectedTime(time);
    setShowModal(true);
  };

  const handleCancel = async (appointmentId: Id<"appointments">) => {
    if (window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      try {
        await cancelAppointment({ appointmentId });
        toast.success("Agendamento cancelado com sucesso!");
      } catch (error) {
        toast.error("Erro ao cancelar agendamento.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Agenda de Consultas</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Selecionar Data</h2>
          <input 
            type="date" 
            value={selectedDate.toISOString().split('T')[0]}
            onChange={e => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
            className="w-full p-2 border rounded-lg"
          />
        </div>
        <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Horários para {selectedDate.toLocaleDateString('pt-BR')}</h2>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {timeSlots.map(time => {
              const isBooked = bookedTimes.has(time);
              const appointment = isBooked ? appointments?.find(app => new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) === time) : null;
              return (
                <button 
                  key={time}
                  disabled={isBooked}
                  onClick={() => !isBooked && handleOpenModal(time)}
                  className={`p-2 rounded-lg text-sm text-center font-semibold ` + (isBooked ? 'bg-red-200 text-red-700 cursor-not-allowed' : 'bg-green-100 text-green-800 hover:bg-green-200')}
                >
                  {time}
                  {isBooked && <span className="text-xs block truncate">{appointment?.clientName}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {showModal && <AppointmentModal onClose={() => setShowModal(false)} clients={clients || []} createAppointment={createAppointment} selectedDate={selectedDate} selectedTime={selectedTime!} />}
    </div>
  );
}

// Modal para criar o agendamento
function AppointmentModal({ onClose, clients, createAppointment, selectedDate, selectedTime }: any) {
  const [selectedClientId, setSelectedClientId] = useState<Id<"clients"> | "">("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return toast.error("Por favor, selecione um cliente.");

    const [hour, minute] = selectedTime.split(':').map(Number);
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hour, minute);

    try {
      await createAppointment({
        clientId: selectedClientId,
        clientName: clients.find((c: Doc<"clients">) => c._id === selectedClientId)?.name ?? "",
        date: appointmentDate.getTime(),
        notes,
      });
      toast.success("Agendamento criado com sucesso!");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Falha ao criar agendamento.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Agendar para {selectedTime}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cliente</label>
            <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value as Id<"clients"> | "")} className="w-full p-2 border rounded-lg">
              <option value="">Selecione...</option>
              {clients.map((c: Doc<"clients">) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Observações</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 border rounded-lg" />
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-lg">Cancelar</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Confirmar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
