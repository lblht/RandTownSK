<template>
  <div class="flex flex-row justify-center h-screen w-screen bg-cc-dark-purple">
    <div class="flex flex-col md:flex-row w-full">
      <div class="md:max-w-md">
        <div class="relative w-full flex justify-center">
          <img ref="bgImage" src="/bg-image.svg" alt="Image" class="w-full" />
          <h1 ref="townText" class="picked-town-text text-center font-semibold leading-none text-cc-purple">{{ pickedTown }}</h1>
        </div>

        <div class="w-full flex flex-col items-center justify-center mt-6">
          <div class="flex flex-row w-96 justify-between text-white">
            <div class="flex flex-col mb-4 ml-2">
              <label class="text-cc-purple">Filter</label>
              <div>
                <input type="radio" id="all" name="filterType" value="all" v-model="filterType" class="radio-button" />
                <label for="all" class="ml-2">All</label>
              </div>

              <div>
                <input type="radio" id="region" name="filterType" value="region" v-model="filterType" class="radio-button" />
                <label for="region" class="ml-2">Region</label>
              </div>

              <div>
                <input type="radio" id="county" name="filterType" value="county" v-model="filterType" class="radio-button" />
                <label for="county" class="ml-2">County</label>
              </div>
            </div>

            <div class="mr-2 w-full max-w-56">
              <div v-if="filterType !== 'all'" class="relative">
                <label class="text-cc-purple capitalize">{{ filterType }}</label>
                <input
                  type="text"
                  v-model="search"
                  :placeholder="`Search ${filterType}`"
                  class="p-1 border-none w-full bg-cc-dark-purple focus:outline-none text-xl"
                  @focus="showDropdown = true"
                  @blur="showDropdown = false"
                  @input="showDropdown = true"
                />
                <div class="w-full h-1 bg-cc-purple"></div>
                <ul
                  v-if="showDropdown && filteredOptions.length"
                  class="absolute left-0 right-0 bg-cc-purple border-none mt-1 rounded shadow-lg max-h-60 overflow-y-auto"
                >
                  <li
                    v-for="option in filteredOptions"
                    :key="option"
                    class="p-2 cursor-pointer hover:bg-cc-light-purple"
                    @mousedown="selectOption(option)"
                  >
                    {{ option }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <button
            @click="getTown"
            class="bg-cc-light-purple hover:bg-cc-purple text-white text-2xl font-semibold py-4 px-8 rounded-xl m-2 shadow-md shadow-gray-950"
          >
            Random Town
          </button>
        </div>
      </div>

      <div class="md:w-1 md:h-full bg-cc-purple"></div>

      <div class="flex-grow p-4 min-h-60 min-w-80 bg-cc-dark-purple">
        <div id="map" class="bg-black h-full rounded-lg"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch, nextTick } from 'vue'
  import { fetchData, getCounties, getRegions, pickRandomCity } from './randomCityPicker'
  import L, { Map, Marker } from 'leaflet'
  import 'leaflet/dist/leaflet.css'

  const pickedTown = ref<string>('???????')
  const filterType = ref<string>('all')
  const search = ref<string>('')
  const counties = ref<string[]>([])
  const regions = ref<string[]>([])
  const showDropdown = ref<boolean>(false)
  const bgImage = ref<HTMLImageElement | null>(null)
  const townText = ref<HTMLHeadingElement | null>(null)
  let map: Map
  let currentMarker: Marker | null = null
  const customIcon = L.icon({
    iconUrl: '/custom_pin.png',
    iconSize: [34, 60],
    iconAnchor: [17, 60],
    tooltipAnchor: [17, -45],
  })

  onMounted(async () => {
    await fetchData()
    counties.value = getCounties()
    regions.value = getRegions()
    await nextTick()
    setFontSize()
    window.addEventListener('resize', setFontSize)
    initializeMap()
  })

  function initializeMap() {
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    })

    const streetLayer = L.tileLayer('http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors &amp; USGS',
    })

    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    })

    const hikingLayer = L.tileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Map data: &copy; OpenStreetMap contributors | Map style: &copy; waymarkedtrails.org (CC-BY-SA)',
    })

    const cyclingLayer = L.tileLayer('https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Map data: &copy; OpenStreetMap contributors | Map style: &copy; waymarkedtrails.org (CC-BY-SA)',
    })

    const railwayLayer = L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Map data: &copy; OpenStreetMap contributors | Map style: &copy; OpenRailwayMap (CC-BY-SA)',
    })

    map = L.map('map', {
      center: [48.669, 19.699],
      zoom: 7,
      layers: [satelliteLayer],
      zoomControl: false,
      attributionControl: true,
    })

    const baseMaps = {
      Satellite: satelliteLayer,
      Street: streetLayer,
      Dark: darkLayer,
    }

    const overlayMaps = {
      'Hiking Trails': hikingLayer,
      'Cycling Trails': cyclingLayer,
      Railways: railwayLayer,
    }

    L.control.layers(baseMaps, overlayMaps).addTo(map)
  }

  function setFontSize() {
    if (bgImage.value && townText.value) {
      townText.value.style.fontSize = `${bgImage.value.clientWidth * 0.09}px`
    }
  }

  const filteredOptions = computed<string[]>(() => {
    if (filterType.value === 'region') {
      return regions.value.filter((region) => region.toLowerCase().includes(search.value.toLowerCase()))
    } else if (filterType.value === 'county') {
      return counties.value.filter((county) => county.toLowerCase().includes(search.value.toLowerCase()))
    }
    return []
  })

  function selectOption(option: string) {
    search.value = option
    showDropdown.value = false
  }

  function getTown() {
    const selectedTown = pickRandomCity(filterType.value === 'county' ? search.value : null, filterType.value === 'region' ? search.value : null)
    if (selectedTown) {
      pickedTown.value = selectedTown.properties.city

      map.eachLayer((layer) => {
        if (layer instanceof L.GeoJSON) {
          map.removeLayer(layer)
        }
      })
      if (currentMarker) {
        map.removeLayer(currentMarker)
      }

      currentMarker = L.marker( 
        [selectedTown.geometry.coordinates[1], selectedTown.geometry.coordinates[0]], 
        { icon: customIcon }
      ).addTo(map).bindTooltip(pickedTown.value)

      map.flyTo([selectedTown.geometry.coordinates[1], selectedTown.geometry.coordinates[0]], 15, {
        animate: true,
        duration: 2,
      })
    } else {
      pickedTown.value = 'No city found'
    }
  }

  watch(() => filterType.value, () => {search.value = ''})
</script>
