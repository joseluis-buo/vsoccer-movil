"""Capturas de la app para la presentación, en tamaño de celular.

Recorre la app en la versión web con Playwright y guarda una captura por paso
en capturas/, numeradas en el orden del recorrido.

ANTES DE CORRERLO
  El recorrido CAPTURA UNA EVALUACIÓN DE HOY, así que el backend debe usar una
  base desechable, nunca la de Neon. En la carpeta del backend:

      rm -f /tmp/capturas.sqlite3          # base nueva en cada corrida
      export DATABASE_URL=sqlite:////tmp/capturas.sqlite3
      python manage.py migrate
      python manage.py seed_demo
      python manage.py runserver 127.0.0.1:8001

  (seed_demo no borra la evaluación de hoy de una corrida anterior; sin una
  base nueva, el servidor rechaza la captura con 409 y el recorrido falla.)

  Y en esta carpeta, la app web apuntando a ese backend. --clear importa:
  sin él, Metro puede servir un bundle viejo con otra API_URL.

      API_URL=http://localhost:8001/api/v1/ npx expo start --web --clear

  Luego:  python3 scripts/capturas.py

"Sin red" se simula bloqueando las peticiones a la API (la app ve lo mismo
que sin señal). Al final se apaga y prende la red del navegador para que la
app reciba el aviso de "volvió la red" y envíe la cola sola.
"""

import os
from pathlib import Path

from playwright.sync_api import Page, sync_playwright

APP = os.environ.get("APP_URL", "http://localhost:8081")
API = os.environ.get("API_PATRON", "http://localhost:8001/**")
CARPETA = Path(__file__).resolve().parent.parent / "capturas"

# Tamaño del prototipo (iPhone 390 × 844), a 3x para que se vea nítido en las diapositivas.
CELULAR = {"viewport": {"width": 390, "height": 844}, "device_scale_factor": 3}

GRUPO = "Menor · Martes y Jueves"
ALUMNO = "Diego Salinas Ruiz"  # hijo del papá demo: su evaluación se ve después en modo Familia


def capturar(pagina: Page, nombre: str):
    pagina.wait_for_timeout(700)  # que terminen las animaciones
    pagina.screenshot(path=CARPETA / f"{nombre}.png")
    print("  ✓", nombre)


def iniciar_sesion(pagina: Page, usuario: str, contrasena: str, captura: str | None = None):
    pagina.goto(APP)
    pagina.locator("input").nth(0).fill(usuario)
    pagina.locator("input").nth(1).fill(contrasena)
    if captura:
        pagina.locator("input").nth(1).blur()  # sin el contorno de foco del navegador
        capturar(pagina, captura)
    pagina.get_by_role("button", name="Entrar").click()


def pestana(pagina: Page, nombre: str):
    pagina.get_by_text(nombre, exact=True).last.click()


def subir(pagina: Page, habilidad: str, veces: int):
    for _ in range(veces):
        pagina.get_by_role("button", name=f"Subir {habilidad}").click()


def main():
    CARPETA.mkdir(exist_ok=True)
    with sync_playwright() as p:
        navegador = p.chromium.launch()
        contexto = navegador.new_context(**CELULAR)
        pagina = contexto.new_page()

        print("Modo Entrenador")
        iniciar_sesion(pagina, "entrenador", "entrenador", "01-inicio-de-sesion")
        pagina.get_by_role("button", name=f"Abrir grupo {GRUPO}").wait_for()
        capturar(pagina, "02-entrenador-inicio-con-grupos")

        pagina.get_by_role("button", name=f"Abrir grupo {GRUPO}").first.click()
        pagina.get_by_text("evaluados hoy").wait_for()
        capturar(pagina, "03-entrenador-lista-del-grupo")

        pagina.get_by_role("button", name=f"Evaluar a {ALUMNO}").click()
        pagina.get_by_text("Promedio tentativo").wait_for()
        subir(pagina, "Pase", 3)
        subir(pagina, "Recepción", 2)
        subir(pagina, "Tiro", 4)
        pagina.get_by_placeholder("Opcional").fill("Buen control con pierna izquierda. Trabajar el pase largo.")
        pagina.locator("textarea").blur()
        capturar(pagina, "04-entrenador-captura-de-evaluacion")

        # Se va la señal justo antes de guardar.
        contexto.route(API, lambda ruta: ruta.abort())
        pagina.get_by_role("button", name="Guardar").click()
        pagina.get_by_text("Guardado en el teléfono").wait_for()
        capturar(pagina, "05-entrenador-guardado-sin-conexion")

        pestana(pagina, "Sincronizar")
        pagina.get_by_role("button", name="Reintentar todas").wait_for()
        capturar(pagina, "06-entrenador-sincronizar-con-pendiente")

        # Vuelve la señal: la app recibe el aviso y envía la cola sola.
        contexto.unroute(API)
        contexto.set_offline(True)
        pagina.wait_for_timeout(500)
        contexto.set_offline(False)
        pagina.get_by_text("Todo está sincronizado").wait_for(timeout=20000)

        pestana(pagina, "Grupos")
        pagina.get_by_role("button", name="Volver a la lista").click()
        fila = pagina.get_by_role("button", name=f"Evaluar a {ALUMNO}, ya evaluado hoy")
        fila.wait_for(timeout=20000)
        capturar(pagina, "07-entrenador-alumno-evaluado-tras-sincronizar")

        fila.click()
        pagina.get_by_role("button", name=f"Ver historial de {ALUMNO}").click()
        pagina.get_by_text("Último promedio").wait_for()
        capturar(pagina, "08-entrenador-ficha-del-alumno")

        pestana(pagina, "Perfil")
        pagina.get_by_text("Cerrar sesión").wait_for()
        pagina.get_by_text("alumno").first.wait_for()
        capturar(pagina, "09-entrenador-perfil")
        pagina.get_by_text("Cerrar sesión").click()

        print("Modo Familia")
        pagina.get_by_role("button", name="Entrar").wait_for()
        iniciar_sesion(pagina, "5512345678", "tutor")
        pagina.get_by_role("button", name=f"Ver ficha de {ALUMNO}").wait_for()
        capturar(pagina, "10-familia-mis-hijos")

        pagina.get_by_role("button", name=f"Ver ficha de {ALUMNO}").click()
        pagina.get_by_text("Última evaluación").wait_for()
        capturar(pagina, "11-familia-detalle-del-hijo")

        navegador.close()
    print(f"Listo: {CARPETA}")


if __name__ == "__main__":
    main()
