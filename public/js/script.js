document.getElementById('btn1').onclick = () => {
  const select = document.querySelector("select[name='especialidade2']")
  const value = select.value;
  const option = select.querySelector(`option[value='${value}']`)
  const text = option.innerText
  console.log(text)
}

function pesquisarMedico() {
  let input = document.getElementById('pesquisaMedico')
  let filtro = input.value.toUpperCase()
  let tabela = document.getElementById('tabela')
  let tr = tabela.getElementsByTagName('tr')

  for (let i = 0; i < tr.length; i++) {
    let td = tr[i].getElementsByTagName('td')[0]
    if (td) {
      let texto = td.innerText || td.textContent
      if (texto.toUpperCase().indexOf(filtro) > -1) {
        tr[i].style.display = ""
      } else {
        tr[i].style.display = "none"
      }
    }
  }
}


function pesquisarEspecial() {
  let input = document.getElementById('pesquisarEspecial')
  let filtro = input.value.toUpperCase()
  let tabela = document.getElementById('tabela')
  let tr = tabela.getElementsByTagName('tr')

  for (let i = 0; i < tr.length; i++) {
    let td = tr[i].getElementsByTagName('td')[2]
    if (td) {
      let texto = td.innerText || td.textContent
      if (texto.toUpperCase().indexOf(filtro) > -1) {
        tr[i].style.display = ""
      } else {
        tr[i].style.display = "none"
      }
    }
  }
}

function selector() {
   $(".alert").alert('close')
}