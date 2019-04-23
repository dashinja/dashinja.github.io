import BCS_LINKS from "./link-items"
// Light Box

console.log('hi')
$(() => {
  console.log('only when ready')

  BCS_LINKS.forEach(item => {

    const icon = $(`<div
              class="card bg-dark text-white rounded border border-success my-sm-3 my-md-4"
            >
              <a
                href=`${BCS_LINKS[i].a.href}`
                target="_blank"
                class="text-white"
                data-fancybox=`${BCS_LINKS[i].a.fancybox}`
              >
                <img
                  class="card-img"
                  style="height: 200px; width: 200px;"
                  src=`${BCS_LINKS[i].img.src}`
                  alt=`${ BCS_LINKS[i].img.alt }`
                />
                <div
                  class="card-img-overlay container p-1 d-flex d-column justify-content-center align-items-end"
                >
                  <div class="row bg-success w-100 text-center mb-2 py-2 rounded">
                    <h5 class="card-title w-100 m-0 p-0 col rounded">
                      `${ BCS_LINKS[i].banner}`
                    </h5>
                  </div>
                </div>
              </a>
            </div>`)
  })


  const eachNOTbootcamp = $('div.projects__not-bootcamp>section>div>a')

  console.log('eachNOTbootcampInit:', eachNOTbootcamp)
  eachNOTbootcamp.attr('data-fancybox', 'non-bcs')

  const eachBootcampAnchorImage = $('div.projects__bootcamp>section>div>a')
  console.log('eachAnchorInitialselection:', eachBootcampAnchorImage)

  eachBootcampAnchorImage.attr('data-fancybox', 'bcs')
  console.log('eachanghorimage after set attribute:', eachBootcampAnchorImage)

  const bootcampImg = $('div.projects__bootcamp>section>div>a>img')

  console.log('bootcampimg:', bootcampImg)

  console.log('bootcampHref', bootcampHref)

  console.log(
    "selection of just the data-fancybox='non-bcs':",
    $('[data-fancybox=bcs]'),
  )
})
