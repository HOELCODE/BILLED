import VerticalLayout from './VerticalLayout.js'
import ErrorPage from "./ErrorPage.js"
import LoadingPage from "./LoadingPage.js"

import Actions from './Actions.js'

const row = (bill) => {
  return (`
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${bill.date}</td>
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
    `)
  }

// Ordonnee par date decroissante ********
const monthMap = {
  "Jan.": 1,
  "Fév.": 2,
  "Mar.": 3,
  "Avr.": 4,
  "Mai.": 5,
  "Juin.": 6,
  "Juil.": 7,
  "Aoû.": 8,
  "Sep.": 9,
  "Oct.": 10,
  "Nov.": 11,
  "Déc.": 12
};

const parseDateParts = (dateStr) => {
  const parts = dateStr.trim().split(" ");
  // Mettre null si date icomplete
  if (parts.length !== 3) return null;

  // reformater la date
  const [dayStr, monthLabel, yearStr] = parts;
  const day = parseInt(dayStr, 10);
  const month = monthMap[monthLabel];
  const year = parseInt(yearStr, 10);

  // Si l'un des éléments est invalide, retourner null
  if (!day || !month || !year) return null;

  return {
    year: year + 2000,
    month,
    day
  };
};

const customSort = (a, b) => {
  // Convertir les dates en objets avec année, mois et jour
  const dateA = parseDateParts(a.date);
  const dateB = parseDateParts(b.date);

  // Mettre les dates invalides à la fin
  if (!dateA && !dateB) return 0;
  if (!dateA) return 1;
  if (!dateB) return -1;

  // Comparer les dates par année, mois et jour pour avoir un trie parfaitement décroissant
  if (dateA.year !== dateB.year) return dateB.year - dateA.year;
  if (dateA.month !== dateB.month) return dateB.month - dateA.month;
  return dateB.day - dateA.day;
};

const rows = (data) => {
  if (!data || data.length === 0) return "";

  const filteredData = data.filter(bill => parseDateParts(bill.date));
  const sortedData = filteredData.sort(customSort);

  return sortedData.map(bill => row(bill)).join("");
};


export default ({ data: bills, loading, error }) => {
  
  const modal = () => (`
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `)

  if (loading) {
    return LoadingPage()
  } else if (error) {
    return ErrorPage(error)
  }
  
  return (`
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`
  )
}