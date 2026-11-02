import { createContext, useContext } from 'react'

// Общее состояние лендинга: параметры, которые пользователь уже выбрал
// в калькуляторе или на карте, передаются в форму заявки (принцип приверженности).
export const LeadContext = createContext({ lead: {}, updateLead: () => {}, goToForm: () => {} })
export const useLead = () => useContext(LeadContext)
