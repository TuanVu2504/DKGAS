
export const api = <T=any>(url: string, option?: RequestInit) => 
            fetch(url, option)
            .then(async res => { 
              if(!res.ok){
                const error_message = await res.json()
                console.log(error_message)
                throw new Error(error_message.message)
              }
              return res.json() as Promise<T>
            })