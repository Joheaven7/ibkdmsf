export const mockResidents = [
  { id: 1, fullName: 'Dawit Tesfaye', fatherName: 'Tesfaye Alemu', motherName: 'Aselefech Bekele', gender: 'Male', dob: '1990-03-14', kebele: '03', houseNo: 'B-142', phone: '0911234567', idNo: 'ET-03-0001', status: 'active', registeredAt: '2023-01-10' },
  { id: 2, fullName: 'Selamawit Girma', fatherName: 'Girma Tadesse', motherName: 'Birtukan Demeke', gender: 'Female', dob: '1985-07-22', kebele: '03', houseNo: 'A-217', phone: '0922345678', idNo: 'ET-03-0002', status: 'active', registeredAt: '2023-02-15' },
  { id: 3, fullName: 'Yohannes Mulatu', fatherName: 'Mulatu Hailu', motherName: 'Tigist Woldemariam', gender: 'Male', dob: '1978-11-05', kebele: '03', houseNo: 'C-089', phone: '0933456789', idNo: 'ET-03-0003', status: 'active', registeredAt: '2023-03-01' },
  { id: 4, fullName: 'Mekdes Worku', fatherName: 'Worku Nega', motherName: 'Hiwot Lemma', gender: 'Female', dob: '1995-01-30', kebele: '03', houseNo: 'D-334', phone: '0944567890', idNo: 'ET-03-0004', status: 'inactive', registeredAt: '2023-04-20' },
  { id: 5, fullName: 'Solomon Bekele', fatherName: 'Bekele Chala', motherName: 'Meseret Abebe', gender: 'Male', dob: '1988-09-18', kebele: '03', houseNo: 'B-201', phone: '0955678901', idNo: 'ET-03-0005', status: 'active', registeredAt: '2023-05-11' },
  { id: 6, fullName: 'Hiwot Alemu', fatherName: 'Alemu Desta', motherName: 'Azeb Tesfaye', gender: 'Female', dob: '1993-06-07', kebele: '03', houseNo: 'A-115', phone: '0966789012', idNo: 'ET-03-0006', status: 'active', registeredAt: '2023-06-03' },
]

export const mockCertificateRequests = [
  { id: 1, residentId: 3, residentName: 'Dawit Tesfaye', type: 'birth', purpose: 'School enrollment', status: 'pending', submittedAt: '2024-01-15', reviewedAt: null, reviewNote: '' },
  { id: 2, residentId: 2, residentName: 'Selamawit Girma', type: 'residency', purpose: 'Bank account opening', status: 'approved', submittedAt: '2024-01-10', reviewedAt: '2024-01-12', reviewNote: 'All documents verified.' },
  { id: 3, residentId: 3, residentName: 'Yohannes Mulatu', type: 'death', purpose: 'Estate settlement', status: 'rejected', submittedAt: '2024-01-08', reviewedAt: '2024-01-09', reviewNote: 'Insufficient supporting documents.' },
  { id: 4, residentId: 4, residentName: 'Mekdes Worku', type: 'birth', purpose: 'Passport application', status: 'pending', submittedAt: '2024-01-18', reviewedAt: null, reviewNote: '' },
  { id: 5, residentId: 5, residentName: 'Solomon Bekele', type: 'residency', purpose: 'Employment verification', status: 'approved', submittedAt: '2024-01-05', reviewedAt: '2024-01-07', reviewNote: 'Verified.' },
  { id: 6, residentId: 6, residentName: 'Hiwot Alemu', type: 'birth', purpose: 'Marriage registration', status: 'pending', submittedAt: '2024-01-20', reviewedAt: null, reviewNote: '' },
]

export const mockUsers = [
  { id: 1, name: 'Abebe Kebede', email: 'admin@ibkdms.gov.et', role: 'admin', phone: '0911000001', kebele: '03', status: 'active', createdAt: '2023-01-01' },
  { id: 2, name: 'Tigist Haile', email: 'clerk@ibkdms.gov.et', role: 'clerk', phone: '0911000002', kebele: '03', status: 'active', createdAt: '2023-01-05' },
  { id: 7, name: 'Mulugeta Seifu', email: 'clerk2@ibkdms.gov.et', role: 'clerk', phone: '0911000007', kebele: '03', status: 'active', createdAt: '2023-03-10' },
]

export const mockVitalEvents = [
  { id: 1, type: 'birth', name: 'Biruk Tesfaye', fatherName: 'Tesfaye Alemu', motherName: 'Hiwot Bekele', dob: '2024-01-03', gender: 'Male', kebele: '03', recordedAt: '2024-01-05', recordedBy: 'Tigist Haile' },
  { id: 2, type: 'death', name: 'Alemayehu Girma', age: 74, cause: 'Natural causes', dod: '2024-01-08', kebele: '03', recordedAt: '2024-01-09', recordedBy: 'Tigist Haile' },
  { id: 3, type: 'birth', name: 'Rediet Mulatu', fatherName: 'Mulatu Worku', motherName: 'Eden Haile', dob: '2024-01-12', gender: 'Female', kebele: '03', recordedAt: '2024-01-13', recordedBy: 'Mulugeta Seifu' },
]

export const mockMarriages = [
  { id: 1, husbandName: 'Solomon Bekele', wifeName: 'Mekdes Worku', husbandId: 'ET-03-0005', wifeId: 'ET-03-0004', date: '2024-01-10', witnessName: 'Abebe Girma', witnessPhone: '0911111111', kebele: '03', status: 'approved', note: 'All documents verified.', registeredAt: '2024-01-10', registeredBy: 'Tigist Haile' },
  { id: 2, husbandName: 'Yohannes Mulatu', wifeName: 'Hiwot Alemu', husbandId: 'ET-03-0003', wifeId: 'ET-03-0006', date: '2024-01-18', witnessName: 'Dawit Tadesse', witnessPhone: '0922222222', kebele: '03', status: 'pending', note: '', registeredAt: '2024-01-18', registeredBy: 'Mulugeta Seifu' },
]

export const mockDivorces = [
  { id: 1, partner1: 'Dawit Tesfaye', partner2: 'Selamawit Girma', partner1Id: 'ET-03-0001', partner2Id: 'ET-03-0002', date: '2024-01-05', reason: 'Mutual consent', kebele: '03', status: 'approved', note: 'Court order provided.', registeredAt: '2024-01-06', registeredBy: 'Tigist Haile' },
  { id: 2, partner1: 'Tesfaye Alemu', partner2: 'Birtukan Haile', partner1Id: '', partner2Id: '', date: '2024-01-20', reason: '', kebele: '03', status: 'pending', note: '', registeredAt: '2024-01-20', registeredBy: 'Mulugeta Seifu' },
]
